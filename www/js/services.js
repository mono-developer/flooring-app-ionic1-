angular.module('starter.services', [])

.factory('Server', function ($http) {
        return {
            httpDetails: function ( method, url, data) {
                return $http({
                    headers: 'Content-Type:application/json',
                    method: method,
                    url: url,
                    data: JSON.stringify(data)
                }).success(function (response) {
                    return response;
                }).error(function (error) {
                    return error;
                });
            }
        }
})

.factory('InvoiceService', function ($q) {

    function formatDate() {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hours = d.getHours(),
            minutes = d.getMinutes(),
            seconds = d.getSeconds();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day, hours, minutes, seconds].join('-');
    }

    function createSubDir(dirname, callback, error) {
        try {
            if (ionic.Platform.platform() != 'android') {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                  // console.log('fileSystem', fileSystem);
                      fileSystem.root.getDirectory(dirname, {create: true}, callback, error);
                }, error);
            } else {
                window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (fileSystem) {
                    fileSystem.getDirectory(dirname, {create: true, exclusive: false}, callback, error);
                }, error);
            }
        } catch (err) {
            error();
        }
    }

    function createPdf(invoice) {
      return $q(function (resolve, reject) {
        var dd = createDocumentDefinition(invoice);
        var pdf = pdfMake.createPdf(dd);

        pdf.getBase64(function (output) {
            resolve(base64ToUint8Array(output));
        });
      });
    }

    function downloadPdf(invoice, fileName) {
        var folder_name = {
            folder_name: formatDate(),
            file_name: fileName + '.pdf'
        };
        return $q(function (resolve, reject) {
          var dd = createDocumentDefinition(invoice);
            var pdf = pdfMake.createPdf(dd);
            pdf.getBuffer(function (buffer) {
                var utf8 = new Uint8Array(buffer);
                var binaryArray = utf8.buffer;

                var dirname = folder_name.folder_name;
                createSubDir(dirname, function (dirEntry) {
                    dirEntry.getFile(folder_name.file_name, {create: true, exclusive: true}, function (fileEntry) {
                        fileEntry.createWriter(function (writer) {
                            writer.write(binaryArray);
                            console.log('entry', JSON.stringify(dirEntry));
                            resolve(dirEntry.nativeURL + folder_name.file_name);
                        }, function () {
                            reject('Failed to create ' + folder_name.file_name);
                        });
                    });
                }, function () {
                    reject("Failed to create subdirectory");
                })
            })
        });
      }

    return {
      createPdf: createPdf,
      downloadPdf: downloadPdf
    };

    function createDocumentDefinition(invoice) {

        var items = invoice.Items.map(function (item) {

            return [item.Sales_person, item.SKU, item.Description, item.Color, item.Price, item.Cost, item.Total];
        });
        var items2 = invoice.Item2s.map(function (item) {
            var unit = item.count?item.count:'';
            var sku_num = item.sku_num?item.sku_num:'';
            var name = item.name?item.name:'';
            var color = item.color?item.color:'';
            var cost = item.cost?item.cost:'';
            var min_shipping_cost = item.min_shipping_cost?item.min_shipping_cost:'';
            var price = item.price ? parseFloat(item.price).toFixed(2):'';

            return [unit, sku_num, name, color, cost, min_shipping_cost, price];
        });

        var dd = {
            content: [
                { text:'INVOICE', style:'title'},
                { text: 'STORE INFORMATION', style:'header'},
                {
                  style: 'totalsTable',
                  table: {
                    widths: ['*', 90, 125],
                    body:[
                      [ invoice.Information.Address, 'PURCHASE NO', ''],
                      [ invoice.Information.City, 'DATE:', invoice.Date],
                      [ invoice.Information.Phone, '', ''],
                      [ invoice.Information.Email, '', '']
                    ]
                  },
                  layout: 'noBorders'
                },
                {
                  style: 'totalsTable',
                  table: {
                    widths: ['*', 250],
                    body:[
                      [
                        { text: 'SOLD TO', style:'subheader'},
                        { text: 'SHIP TO', style:'subheader'},
                      ],
                      [ invoice.AddressFrom.Name, invoice.AddressTo.Name ],
                      [ invoice.AddressFrom.Company, invoice.AddressTo.Company ],
                      [ invoice.AddressFrom.Address, invoice.AddressTo.Address ],
                      [ invoice.AddressFrom.City, invoice.AddressTo.City ],
                      [ invoice.AddressFrom.Phone, invoice.AddressTo.Phone],
                    ]
                  },
                  layout: 'noBorders'
                },
                { text: '', style: 'subheader' },
                {
                    style: 'itemsTable',
                    table: {
                        widths: ['*', 60, 60, 60, 60, 60, 60],
                        body: [
                            [
                                { text: 'SALESPERSON', style: 'itemsTableHeader' },
                                { text: '', style: 'itemsTableHeader' },
                                { text: '', style: 'itemsTableHeader' },
                                { text: '', style: 'itemsTableHeader' },
                                { text: '', style: 'itemsTableHeader' },
                                { text: '', style: 'itemsTableHeader' },
                                { text: '', style: 'itemsTableHeader' },
                            ]
                        ].concat(items)
                    }
                },
                { text: '', style: 'subheader' },
                {
                    style: 'itemsTable',
                    table: {
                        widths: [40, 65, '*', 50, 55, 65, 60],
                        body: [
                            [
                                { text: 'QTY UNITS', style: 'itemsTableHeader' },
                                { text: 'SKU/CODE', style: 'itemsTableHeader' },
                                { text: 'ITEM NAME / DESCRIPTION', style: 'itemsTableHeader' },
                                { text: 'COLOR', style: 'itemsTableHeader' },
                                { text: 'UNIT PRICE($)', style: 'itemsTableHeader' },
                                { text: 'SHIPPING COST($)', style: 'itemsTableHeader' },
                                { text: 'LINE TOTAL($)', style: 'itemsTableHeader' },
                            ]
                        ].concat(items2)
                    }
                },
                {
                    style: 'totalbottomTable',
                    table: {
                        widths: ['*', 145, 55],
                        body: [
                            [ '', 'Padding ($)', invoice.padding ],
                            [ '', 'Tack Scrips ($)', invoice.tack_script ],
                            [ '', 'Glue ($)', invoice.glue ],
                            [ '', 'Labor ($$)', invoice.labor ],
                            [ '', 'Transition Strips ($)', invoice.trans_script ],
                            [ '', 'DISCOUNT ($)', invoice.discount ],
                            [ '', 'SHIPPING FEE ($)',invoice.shipping_fee ],
                            [ '', 'SALES TAX ($)', invoice.sales_tax ],
                            [ '', 'TOTAL ($)', parseFloat(invoice.Total).toFixed(2) ]
                        ]
                    },
                    layout: 'noBorders'
                },
                { text: 'Make all checks payable to [Your Company Name]', style: 'bottomTable1' },
                { text: 'THANK YOU FOR YOUR BUSINESS!', style: 'bottomTable2' },
            ],
            styles: {
                title:{
                  fontSize: 25,
                  bold: true,
                  alignment:'center',
                  margin: [0, 0, 0, 40]
                },
                header: {
                    fontSize: 19,
                    bold: true,
                    margin: [0, 0, 0, 10],
                    alignment: 'left'
                },
                header_right: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                    position: 'absolute',
                    right: 0
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 5, 0, 5]
                },
                itemsTable: {
                    margin: [0, 5, 0, 15],
                    alignment: 'center'
                },
                itemsTableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black',
                    alignment: 'center'
                },
                totalsTable: {
                    bold: true,
                    margin: [0, 0, 0, 0]
                },
                totalbottomTable: {
                    bold: true,
                    margin: [0, 0, 0, 0],
                    alignment:'right'
                },
                subTable: {
                    bold: true,
                    margin: [0, 0, 0, 0]
                },
                bottomTable1: {
                    alignment:'center',
                    margin: [0, 30, 0, 0]
                },
                bottomTable2: {
                    alignment:'center',
                    fontSize: 18,
                    margin: [0, 0, 0, 0],
                    position: 'absolute',
                    top:0
                },
            },
            defaultStyle: {
            }
        }

        return dd;
    }

    function base64ToUint8Array(base64) {
        var raw = atob(base64);
        var uint8Array = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) {
            uint8Array[i] = raw.charCodeAt(i);
        }
        return uint8Array;
    }

})
.factory('DistributorInvoiceService', function ($q) {

    function formatDate() {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hours = d.getHours(),
            minutes = d.getMinutes(),
            seconds = d.getSeconds();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day, hours, minutes, seconds].join('-');
    }

    function createSubDir(dirname, callback, error) {
        try {
            if (ionic.Platform.platform() != 'android') {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                  // console.log('fileSystem', fileSystem);
                      fileSystem.root.getDirectory(dirname, {create: true}, callback, error);
                }, error);
            } else {
                window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (fileSystem) {
                    fileSystem.getDirectory(dirname, {create: true, exclusive: false}, callback, error);
                }, error);
            }
        } catch (err) {
            error();
        }
    }

    function createPdf(invoice) {
      return $q(function (resolve, reject) {
        var dd = createDocumentDefinition(invoice);
        var pdf = pdfMake.createPdf(dd);

        pdf.getBase64(function (output) {
            resolve(base64ToUint8Array(output));
        });
      });
    }

    function downloadPdf(invoice, fileName) {
        var folder_name = {
            folder_name: formatDate(),
            file_name: fileName + '.pdf'
        };
        return $q(function (resolve, reject) {
          var dd = createDocumentDefinition(invoice);
            var pdf = pdfMake.createPdf(dd);
            pdf.getBuffer(function (buffer) {
                var utf8 = new Uint8Array(buffer);
                var binaryArray = utf8.buffer;

                var dirname = folder_name.folder_name;
                createSubDir(dirname, function (dirEntry) {
                    dirEntry.getFile(folder_name.file_name, {create: true, exclusive: true}, function (fileEntry) {
                        fileEntry.createWriter(function (writer) {
                            writer.write(binaryArray);
                            console.log('entry', JSON.stringify(dirEntry));
                            resolve(dirEntry.nativeURL + folder_name.file_name);
                        }, function () {
                            reject('Failed to create ' + folder_name.file_name);
                        });
                    });
                }, function () {
                    reject("Failed to create subdirectory");
                })
            })
        });
      }

    return {
      createPdf: createPdf,
      downloadPdf: downloadPdf
    };

    function createDocumentDefinition(invoice) {

        var items2 = invoice.Item2s.map(function (item) {
            var unit = item.count?item.count:'';
            var sku_num = item.sku_num?item.sku_num:'';
            var name = item.name?item.name:'';
            var color = item.color?item.color:'';
            var cost = item.cost?item.cost:'';
            var min_shipping_cost = item.min_shipping_cost?item.min_shipping_cost:'';
            var price = item.price ? parseFloat(item.price).toFixed(2):'';

            return [unit, sku_num, name, color, cost, min_shipping_cost, price];
        });

        var dd = {
            content: [
                { text:'INVOICE', style:'title'},
                { text: 'STORE INFORMATION', style:'header'},
                //

                {
                  style: 'totalsTable',
                  table: {
                    widths: ['*', 90, 125],
                    body:[
                      [ invoice.Information.Address, 'PURCHASE NO', '' ],
                      [ invoice.Information.City, 'DATE:', invoice.Date ],
                      [ invoice.Information.Phone, '', ''],
                      [ invoice.Information.Email, '', '' ]
                    ]
                  },
                  layout: 'noBorders'
                },
                {
                  style: 'totalsTable',
                  table: {
                    widths: ['*', 250],
                    body:[
                      [
                        { text: 'SOLD TO', style:'subheader'},
                        { text: 'SHIP TO', style:'subheader'},
                      ],
                      [ invoice.AddressFrom.Name, invoice.AddressTo.Name ],
                      [ invoice.AddressFrom.Company, invoice.AddressTo.Company ],
                      [ invoice.AddressFrom.Address, invoice.AddressTo.Address ],
                      [ invoice.AddressFrom.City, invoice.AddressTo.City ],
                      [ invoice.AddressFrom.Phone, invoice.AddressTo.Phone],
                    ]
                  },
                  layout: 'noBorders'
                },
                { text: '', style: 'subheader' },
                {
                    style: 'itemsTable',
                    table: {
                        widths: [40, 65, '*', 50, 55, 65, 60],
                        body: [
                            [
                                { text: 'QTY UNITS', style: 'itemsTableHeader' },
                                { text: 'SKU/CODE', style: 'itemsTableHeader' },
                                { text: 'ITEM NAME / DESCRIPTION', style: 'itemsTableHeader' },
                                { text: 'COLOR', style: 'itemsTableHeader' },
                                { text: 'UNIT PRICE($)', style: 'itemsTableHeader' },
                                { text: 'SHIPPING COST($)', style: 'itemsTableHeader' },
                                { text: 'LINE TOTAL($)', style: 'itemsTableHeader' },
                            ]
                        ].concat(items2)
                    }
                },

                { text: 'Make all checks payable to [Your Company Name]', style: 'bottomTable1' },
                { text: 'THANK YOU FOR YOUR BUSINESS!', style: 'bottomTable2' },
            ],
            styles: {
                title:{
                  fontSize: 25,
                  bold: true,
                  alignment:'center',
                  margin: [0, 0, 0, 40]
                },
                header: {
                    fontSize: 19,
                    bold: true,
                    margin: [0, 0, 0, 10],
                    alignment: 'left'
                },
                header_right: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                    position: 'absolute',
                    right: 0
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 5, 0, 5]
                },
                itemsTable: {
                    margin: [0, 5, 0, 15],
                    alignment: 'center'
                },
                itemsTableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black',
                    alignment: 'center'
                },
                totalsTable: {
                    bold: true,
                    margin: [0, 0, 0, 0]
                },
                totalbottomTable: {
                    bold: true,
                    margin: [0, 0, 0, 0],
                    alignment:'right'
                },
                subTable: {
                    bold: true,
                    margin: [0, 0, 0, 0]
                },
                bottomTable1: {
                    alignment:'center',
                    margin: [0, 30, 0, 0]
                },
                bottomTable2: {
                    alignment:'center',
                    fontSize: 18,
                    margin: [0, 0, 0, 0],
                    position: 'absolute',
                    top:0
                },
            },
            defaultStyle: {
            }
        }
        return dd;
    }

    function base64ToUint8Array(base64) {
        var raw = atob(base64);
        var uint8Array = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) {
            uint8Array[i] = raw.charCodeAt(i);
        }
        return uint8Array;
    }

})


;
