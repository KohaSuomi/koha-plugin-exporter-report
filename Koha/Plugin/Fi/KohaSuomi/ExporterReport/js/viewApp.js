new Vue({
  el: '#viewApp',
  created() {
    this.fetchExports();
  },
  data: {
    results: [],
    errors: [],
    status: 'pending',
    isActive: false,
    page: 1,
    limit: 50,
    pages: 1,
    startCount: 1,
    endPage: 11,
    lastPage: 0,
    targetId: null,
    showCheckActive: false,
    activation: {},
    showModifyActivation: false,
    identifier_field: '',
    identifier: '',
    success: '',
  },
  methods: {
    fetchExports() {
      this.errors = [];
      this.results = [];
      axios
        .get(baseendpoint + 'biblio/report/' + environment, {
          headers: { Authorization: apitoken },
          params: { status: this.status, page: this.page, limit: this.limit },
        })
        .then((response) => {
          this.results = response.data.results;
          this.pages = Math.ceil(response.data.count / this.limit);
          if (this.pages == 0) {
            this.pages = 1;
          }
          this.activate();
        })
        .catch((error) => {
          if (!error.response.data.error) {
            this.errors.push(error.message);
          }
          this.errors.push(error.response.data.error);
        });
    },
    getExports() {
      this.errors = [];
      this.results = [];
      this.page = 1;
      axios
        .get(baseendpoint + 'biblio/report/' + environment, {
          headers: { Authorization: apitoken },
          params: {
            status: this.status,
            page: this.page,
            limit: this.limit,
            target_id: this.targetId,
          },
        })
        .then((response) => {
          this.results = response.data.results;
          this.pages = Math.ceil(response.data.count / this.limit);
          if (this.pages == 0) {
            this.pages = 1;
          }
          this.activate();
        })
        .catch((error) => {
          this.errors.push(error.response.data.error);
        });
    },
    getActiveRecord(e) {
      e.preventDefault();
      this.errors = [];
      axios
        .get(
          baseendpoint + 'biblio/active/' + environment + '/' + this.targetId,
          {
            headers: { Authorization: apitoken },
          }
        )
        .then((response) => {
          this.activation = response.data;
        })
        .catch((error) => {
          this.errors.push(error.response.data.error);
        });
    },
    updateActiveRecord(e) {
      this.success = '';
      this.errors = [];
      if (
        this.identifier_field == '003|001' &&
        !this.identifier.includes('|')
      ) {
        this.errors.push(
          'Standardinumero ei ole oikeassa muodossa, erota kentät putkella -> 003|001'
        );
      }
      if (!this.errors.length) {
        var params = new URLSearchParams();
        params.append('identifier_field', this.identifier_field);
        params.append('identifier', this.identifier);
        axios
          .put(baseendpoint + 'biblio/active/' + this.activation.id, params, {
            headers: { Authorization: apitoken },
          })
          .then(() => {
            this.success =
              'Tietue ' + this.activation.target_id + ' päivitetty!';
            this.getActiveRecord(e);
            this.showModifyActivation = false;
          })
          .catch((error) => {
            this.errors.push(error.response.data.error);
          });
      }
    },
    deleteActiveRecord(e) {
      this.success = '';
      this.errors = [];
      if (confirm('Haluatko varmasti poistaa aktivoinnin?')) {
        axios
          .delete(baseendpoint + 'biblio/active/' + this.activation.id, {
            headers: { Authorization: apitoken },
          })
          .then(() => {
            this.success =
              'Tietueen ' +
              this.activation.target_id +
              ' aktivoinnin poisto onnistui!';
            this.activation = {};
            this.showModifyActivation = false;
          })
          .catch((error) => {
            this.errors.push(error.response.data.error);
          });
      }
    },
    changeStatus(status, event) {
      event.preventDefault();
      this.showCheckActive = false;
      $('.nav-link').removeClass('active');
      $(event.target).addClass('active');
      this.results = [];
      this.status = status;
      this.page = 1;
      this.targetId = '';
      this.fetchExports();
    },
    checkActivation(event) {
      $('.nav-link').removeClass('active');
      $(event.target).addClass('active');
      this.results = [];
      this.pages = 1;
      this.targetId = '';
      this.showCheckActive = true;
    },
    modifyActivation(e) {
      e.preventDefault();
      this.showModifyActivation = true;
      this.identifier = this.activation.identifier;
      this.identifier_field = this.activation.identifier_field;
    },
    closeUpdate() {
      this.showModifyActivation = false;
    },
    changePage(e, page) {
      e.preventDefault();
      if (page < 1) {
        page = 1;
      }
      if (page > this.pages) {
        page = this.pages;
      }
      this.page = page;
      if (this.page == this.endPage) {
        this.startCount = this.page;
        this.endPage = this.endPage + 10;
        this.lastPage = this.page;
      }
      if (this.page < this.lastPage) {
        this.startCount = this.page - 10;
        this.endPage = this.lastPage;
        this.lastPage = this.lastPage - 10;
      }
      this.fetchExports();
    },
    activate() {
      $('.page-link').removeClass('bg-primary text-white');
      $('[data-current=' + this.page + ']').addClass('bg-primary text-white');
    },
    pageHide(page) {
      if (this.pages > 5) {
        if (this.endPage <= page && this.startCount < page) {
          return true;
        }
        if (this.endPage >= page && this.startCount > page) {
          return true;
        }
      }
    },
  },
  filters: {
    moment: function (date) {
      return moment(date).locale('fi').format('D.M.Y H:mm:ss');
    },
  },
});
Vue.component('result-list', {
  template: '#list-items',
  data() {
    return {
      active: false,
      notifyfields: '',
    };
  },
  mounted() {
    if (this.result.diff) {
      this.notify();
    }
  },
  methods: {
    getRecord(e) {
      e.preventDefault();
      $('#modalWrapper').find('#recordModal').remove();
      var html = $(
        '<div id="recordModal" class="modal fade" role="dialog">\
                      <div class="modal-dialog modal-lg">\
                          <div class="modal-content">\
                              <div class="modal-header">\
                                  <h5 class="modal-title">Muutokset</h5>\
                                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">\
                                      <span aria-hidden="true">&times;</span>\
                                  </button>\
                              </div>\
                              <div id="recordWrapper" class="modal-body">\
                              </div>\
                              <div class="modal-footer">\
                                  <button type="button" class="btn btn-default" data-dismiss="modal">Sulje</button>\
                              </div>\
                          </div>\
                      </div>\
                  </div>'
      );
      $('#modalWrapper').append(html);
      var source = parseRecord(JSON.parse(this.result.diff));
      $('#recordModal')
        .find('#recordWrapper')
        .append($('<div class="container">' + source + '</div>'));
      $('#recordModal').modal('toggle');
      this.active = false;
    },
    notify() {
      var record = JSON.parse(this.result.diff);
      var tags = Object.keys(record);
      var notifyFieldsArr = notifyFields.split(',');
      tags.sort();
      tags.forEach((element) => {
        var obj = record[element];
        notifyFieldsArr.forEach((field) => {
          let tag = field.substring(0, 3);
          let code = field.substring(3);
          if (tag == element) {
            if (code) {
              if (obj.new) {
                obj.new.forEach((newtag) => {
                  newtag.subfields.forEach((newsub) => {
                    if (
                      code == newsub.code &&
                      !this.notifyfields.includes(tag + code + '!')
                    ) {
                      this.notifyfields += tag + code + '! ';
                    }
                  });
                });
              } else if (obj.add) {
                obj.add.forEach((addtag) => {
                  addtag.subfields.forEach((addsub) => {
                    if (
                      code == addsub.code &&
                      !this.notifyfields.includes(tag + code + '!')
                    ) {
                      this.notifyfields += tag + code + '! ';
                    }
                  });
                });
              }
            } else {
              this.notifyfields += element + '! ';
            }
          }
        });
      });
    },
  },
  filters: {
    moment: function (date) {
      return moment(date).locale('fi').format('D.M.Y H:mm:ss');
    },
    type: function (type) {
      if (type == 'add') {
        return 'Uusi';
      }
      if (type == 'update') {
        return 'Muokkaus';
      }
    },
  },
  props: ['result'],
});

parseRecord = function (record) {
  var tags = Object.keys(record);
  var html = '<div class="row pb-2">';
  html += '<div class="col-md-6"><b>Vanhat</b></div>';
  html += '<div class="col-md-6"><b>Uudet</b></div>';
  html += '</div>';
  tags.sort();
  tags.forEach((element) => {
    var obj = record[element];
    html += '<div class="row">';
    html += '<div class="col-md-6" style="overflow:hidden;">';
    if (obj.remove) {
      if (element != '999' && element != '942' && element != '952') {
        obj.remove.forEach((removetag) => {
          html += '<div class="col-xs-6">';
          if (removetag.subfields) {
            removetag.subfields.forEach((removesub) => {
              html += '<div class="text-danger"><b>' + element;
              if (removetag.ind1) {
                html += ' ' + removetag.ind1;
              }
              if (removetag.ind2) {
                html += ' ' + removetag.ind2;
              }
              html +=
                ' _' + removesub.code + '</b>' + removesub.value + '</div>';
            });
          } else {
            html += '<b>' + element + '</b> ' + removetag.value;
          }
          html += '</div>';
        });
      }
    }
    if (obj.old) {
      if (element != '999' && element != '942' && element != '952') {
        obj.old.forEach((oldtag) => {
          if (oldtag) {
            html += '<div class="col-xs-6">';
            if (oldtag.subfields) {
              oldtag.subfields.forEach((oldsub) => {
                html += '<div><b>' + element;
                if (oldtag.ind1) {
                  html += ' ' + oldtag.ind1;
                }
                if (oldtag.ind2) {
                  html += ' ' + oldtag.ind2;
                }
                html += ' _' + oldsub.code + '</b>' + oldsub.value + '</div>';
              });
            } else {
              html += '<b>' + element + '</b> ' + oldtag.value;
            }
            html += '</div>';
          }
        });
      }
    }
    html += '</div>';
    html += '<div class="col-md-6" style="overflow:hidden;">';
    if (obj.add) {
      if (element != '999' && element != '942' && element != '952') {
        obj.add.forEach((addtag) => {
          html += '<div class="col-xs-6">';
          if (addtag.subfields) {
            addtag.subfields.forEach((addsub) => {
              html += '<div class="text-success"><b>' + element;
              if (addtag.ind1) {
                html += ' ' + addtag.ind1;
              }
              if (addtag.ind2) {
                html += ' ' + addtag.ind2;
              }
              html += ' _' + addsub.code + '</b>' + addsub.value + '</div>';
            });
          } else {
            html += '<b>' + element + '</b> ' + addtag.value;
          }
          html += '</div>';
        });
      }
    }
    if (obj.new) {
      if (element != '999' && element != '942' && element != '952') {
        obj.new.forEach((newtag) => {
          html += '<div class="col-xs-6">';
          if (newtag.subfields) {
            newtag.subfields.forEach((newsub) => {
              html += '<div><b>' + element;
              if (newtag.ind1) {
                html += ' ' + newtag.ind1;
              }
              if (newtag.ind2) {
                html += ' ' + newtag.ind2;
              }
              html += ' _' + newsub.code + '</b>' + newsub.value + '</div>';
            });
          } else {
            html += '<b>' + element + '</b> ' + newtag.value;
          }
          html += '</div>';
        });
      }
    }
    html += '</div>';

    html += '</div>';
  });

  return html;
};
