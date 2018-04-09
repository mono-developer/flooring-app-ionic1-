angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state) {
  $scope.doLogout = function(){
    $state.go('login');
    localStorage.clear();
  }
})

.controller('LoginCtrl', function($scope, $state, $rootScope, $ionicLoading,  $cordovaDialogs, Server) {

    $scope.detailData={};
      var loading = function() {
         $ionicLoading.show({
             template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
             '<br/><p>Processing...</p>'
         });
    }

    var token = localStorage.getItem('token');
    if(token){
      $state.go('app.home');
    }
    $scope.user = { email:'chang_hanok@protonmail.com', password: '123456'};
    // $scope.user = { email:'', password: ''};

    $scope.doLogin = function(){

    $ionicLoading.show();

      var user_email, password;
      user_email = $scope.user.email;
      user_password = $scope.user.password
      $scope.loginInfo = { 
        "email": user_email, 
        "password": user_password 
      }
      var method = "POST";
      var url =  $rootScope.apiServer + 'login';

      Server.httpDetails( method, url, $scope.loginInfo).then(function (response) {

         if(response.status == 200 ) {
            localStorage.setItem('data', response.data);
            localStorage.setItem('store_id', response.data.store_id);
            $scope.detailData = localStorage.getItem('data');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('type', response.data.type);
            $ionicLoading.hide();
            $state.go('app.home');

         }else {
            $ionicLoading.hide();
            $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
          }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert('Server Error.', 'Error!', 'OK');
     });
  }
})

.controller('SignupCtrl', function($scope, $state, $rootScope, $ionicLoading,  $cordovaDialogs, Server) {

    $scope.$on("$ionicView.beforeEnter", function(event) {
        $scope.getStoreData();
    })
    $scope.getStoreData = function(){
      var method = "GET"
      var url =  $rootScope.apiServer + 'store';

      Server.httpDetails( method, url, '').then(function (response) {
        $ionicLoading.hide();
         if(response.status == 200 ) {
            $scope.stores = response.data;
         }else {
            $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
         }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert('Server Error.', 'Error!', 'OK');
     });
    }
    var loading = function() {
       $ionicLoading.show({
           template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
           '<br/><p>Processing...</p>'
       });
    }

    $scope.user = {username: '', email:'', password: ''};

    $scope.userlists = [
                { title: "Store Owner", id: 0 },
                // { title: "Client", id: 1 },
                { title: "Store Sales", id: 2 },
                { title: "Distributor", id: 3 },
                { title: "Store Manager", id: 4 },
                // { title: "NEX-GEN Employees", id: 5 },
                // { title: "Contractor", value: 6 }
              ];
    $scope.store_id = "59b2e89a734d1d2c1613cf46";
    $scope.changedUserType = function(id){
        $scope.selectedUser = $scope.userlists[id];
    };

    $scope.changedStoreId = function(value){
        $scope.store_id = value._id;
      };

    $scope.doSignUp = function(){
        $ionicLoading.show();
        var username, user_email, user_type, store_id, password;
        username =  $scope.user.username;
        user_email = $scope.user.email;
        user_type = $scope.selectedUser.id;
        store_id = $scope.store_id;
        password = $scope.user.password;

        $scope.uploadData = { "username":$scope.user.username , "email":$scope.user.email, "type": $scope.selectedUser.id, store_id:$scope.store_id , "password":$scope.user.password };
        var method = "POST";
        var url =  $rootScope.apiServer + 'signup';

      Server.httpDetails( method, url, $scope.uploadData).then(function (response) {
           if(response.status == 200 ) {
              $ionicLoading.hide();
               $cordovaDialogs.alert('Registration is completed', 'Alert!', 'OK');
               localStorage.setItem('data', response.data);
               localStorage.setItem('token', response.data.token);
               localStorage.setItem('type', response.data.type);
               $state.go('app.home');
           }else {
              $ionicLoading.hide();
               $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
           }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert('Sign up Error.', 'Error!', 'OK');
       });
     }
})

.controller('HomeCtrl', function($scope, $state, $rootScope, $filter, $ionicLoading, $cordovaDialogs, $cordovaBarcodeScanner, Server) {

  $scope.$on("$ionicView.beforeEnter", function(event) {
      $scope.profileType();
  })

  $scope.profileType = function(){

    $rootScope.user_type = localStorage.getItem('type');
    $rootScope.store_id = localStorage.getItem('store_id');
    $scope.getStoreData()
  }

  var loading = function() {
     $ionicLoading.show({
         template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }

  $scope.getStoreData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'store?token=' + token;

    Server.httpDetails( method, url, '').then(function (response) {
      $ionicLoading.hide();
       if(response.status == 200 ) {
         $scope.storeData = response.data;

         var storeValue = $filter('filter')($scope.storeData, {_id: $rootScope.store_id});
         $scope.storeValue =  storeValue[0];
       }else {
           $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
   }

   $scope.changedStoreId = function(value){
       $rootScope.store_id = value._id;
     };

   $scope.goAddClient = function(){
     $state.go('app.client-add');
   }
   $scope.goAddProduct = function(){
     $state.go('app.product-add', { key:'Add'});
   }


   $scope.scanQR = function(){
     $cordovaBarcodeScanner.scan().then(function(barcodeData) {
         $state.go('app.product-add', {item: JSON.parse(barcodeData.text), key:'Add'});
      }, function(error) {
        console.log(error);
      });
    }

})

.controller('ClientListCtrl', function($scope, $state, $stateParams, $rootScope, $ionicPopup, $ionicLoading, $ionicHistory, $cordovaDialogs, $cordovaToast, Server) {

  $scope.options = {
    loop: false,
    effect: 'fade',
    speed: 500,
  }
  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    $scope.slider = data.slider;
  });

  $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
  });

  $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
    $scope.activeIndex = data.slider.activeIndex;
    $scope.previousIndex = data.slider.previousIndex;
  });

    $scope.$on("$ionicView.beforeEnter", function(event) {
        $scope.selectKey = $stateParams.key;
        $scope.getClientData();
    })

    var loading = function() {
         $ionicLoading.show({
             template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
             '<br/><p>Processing...</p>'
         });
      }

    $scope.getClientData = function(){

      $ionicLoading.show();

      var method = "GET";
      var url = $rootScope.apiServer + 'client?token=' + localStorage.getItem('token');
      var data = '';

      Server.httpDetails( method, url, data).then(function (response) {
           if(response.status == 200 ) {
              $ionicLoading.hide();
             $scope.clientsList = response.data;
           }else {
              $ionicLoading.hide();
               $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
           }
       });
    }

    $scope.goClientDetailPage = function(item){
      $state.go('app.client-detail', { item: item});
    }

    $scope.checkItems = $stateParams.clients;

    $scope.print = function() {
    console.log($scope.checkItems);
    }

    $scope.saveClientItem = function(){
      var array = [];
      for(i in $scope.checkItems) {
          if($scope.checkItems[i] == true) {
              array.push(i);
          }
      }
      $scope.saveProduct(array);
    }


$scope.saveProduct = function(value){

      method = "PATCH";
      url = $rootScope.apiServer + 'product/' + $stateParams.id;
      $scope.clientValue = { "token": localStorage.getItem('token'), "client_ids": value }

      $ionicLoading.show();
      Server.httpDetails( method, url, $scope.clientValue).then(function (response) {
        $ionicLoading.hide();
           if(response.status == 200 ) {
            $ionicHistory.goBack();
           }else {
              $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
           }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert(error.message, 'Error!', 'OK');
       });
    }

    $scope.deleteClient = function(item){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Warning',
        template: 'Are you sure you want to delete this item?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $scope.deleteItem(item._id);
        } 
      });
    };

    $scope.deleteItem = function (value){

      var token =  localStorage.getItem('token');
      var method = "DELETE";
      var url = $rootScope.apiServer + 'client/' + value + '?token=' + token;

      $ionicLoading.show();
      Server.httpDetails( method, url, '').then(function (response) {
        $ionicLoading.hide();
         if(response.status == 200 ) {
           $cordovaToast.show('A Cliet is deleted', 'long', 'center').then(function(success) {
                $scope.getClientData();
             }, function (error) {
            });
         }else {
             $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
         }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert(error.data, 'Error!', 'OK');
       });
     }
})


.controller('ClientAddCtrl', function($scope, $rootScope, $state, $stateParams, $ionicHistory, $ionicLoading, $cordovaDialogs, $ionicNavBarDelegate, Server) {

  var loading = function() {
     $ionicLoading.show({
         template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }

  $scope.client = {};

  $scope.addClient = function (){

       var token =  localStorage.getItem('token');
       $scope.client.token = token

      $ionicLoading.show();
      var url = $rootScope.apiServer + 'client';
      var method = "POST";
      Server.httpDetails( method, url, $scope.client).then(function (response) {
           if(response.status == 200 ) {
              $ionicLoading.hide();
             $ionicHistory.goBack();
           }else {
              $ionicLoading.hide();
              $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
           }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert(error.data, 'Error!', 'OK');
       });
     }
})

.controller('ClientDetailCtrl', function($scope, $state, $stateParams, $filter, $ionicPopup, $rootScope, $ionicLoading, $cordovaToast, $cordovaDialogs, Server) {
  $scope.clientData = $stateParams.item;
  var loading = function() {
     $ionicLoading.show({
         template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }

  $scope.$on("$ionicView.beforeEnter", function(event) {
      $scope.getOrderData();
    })

  $scope.goSelectProduct = function(){
    $state.go('app.product-list', { key:'select'});
  }

  $scope.getOrderData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'order?token=' + token;
    Server.httpDetails( method, url, '').then(function (response) {
      $ionicLoading.hide();
        if(response.status == 200 ) {
          $scope.total_price = 0;
          $scope.orderData = $filter('filter')(response.data, { client_id: $scope.clientData._id});
          console.log('order_list', $scope.orderData);
          for(var i=0; i<$scope.orderData.length; i++){
            var each_price = 0;
            each_price = Number($scope.orderData[i].total_price);
            $scope.total_price += each_price;
          }
          console.log('total_price', $scope.total_price);
        }else {
           $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
        }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
   }

   $scope.updateClient = function(){

        var token =  localStorage.getItem('token');
        var client = { "token": token, "first_name": $scope.clientData.first_name, "last_name": $scope.clientData.last_name,
                        "phone": $scope.clientData.phone, "client_email": $scope.clientData.client_email,
                        "address": $scope.clientData.address, "city": $scope.clientData.city,
                        "state": $scope.clientData.state, "zipcode": $scope.clientData.zipcode
                      }
       var url = $rootScope.apiServer + 'client/' + $scope.clientData._id;
        var method = "PATCH";
       $ionicLoading.show();

       Server.httpDetails( method, url, client).then(function(response) {
            if(response.status == 200 ) {
               $ionicLoading.hide();
            }else {
               $ionicLoading.hide();
               $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
            }
        }).catch(function(error) {
          $ionicLoading.hide();
           $cordovaDialogs.alert(error.data, 'Error!', 'OK');
        });
      }

   $scope.generateOrder = function(){
     $state.go('app.order-add', { item: $scope.clientData});
    }

    $scope.deleteOrder = function(item){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Warning',
        template: 'Are you sure you want to delete this item?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $scope.deleteItem(item._id);
        } else {
        }
      });
    };

    $scope.deleteItem = function (value){

      var token =  localStorage.getItem('token');
      var method = "DELETE";
      var url = $rootScope.apiServer + 'order/' + value + '?token=' + token;
      $ionicLoading.show();
      Server.httpDetails( method, url, '').then(function (response) {
        $ionicLoading.hide();
         if(response.status == 200 ) {
             $cordovaToast.show('A Order is deleted', 'long', 'center').then(function(success) {
                $scope.getOrderData();
             }, function (error) {
            });
         }else {
             $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
         }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert(error.data, 'Error!', 'OK');
       });
     }

    $scope.viewOrderDetail = function(id, item){
      $state.go('app.order-detail', {id: id, item: item});
    }

})


.controller('ClientProductCtrl', function($scope) {

})


.controller('ClientProjectCtrl', function($scope) {

})

// Distributor List

.controller('DistributorListCtrl', function($scope, $state, $rootScope, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaDialogs, Server) {

  var loading = function() {
     $ionicLoading.show({
         template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }
  $scope.input = [];
  $scope.$on("$ionicView.beforeEnter", function(event) {
      $scope.getDistributorData();
  })

  $scope.getDistributorData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'distributor?token=' + token;

    Server.httpDetails( method, url, '').then(function (response) {

      $ionicLoading.hide();

       if(response.status == 200 ) {
         $scope.distributorlist = response.data;
       }else {
          $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
   }

   $scope.deleteDistributor = function(item){
     var confirmPopup = $ionicPopup.confirm({
       title: 'Warning',
       template: 'Are you sure you want to delete this item?'
     });

     confirmPopup.then(function(res) {
       if(res) {
         console.log($scope.deleteItem(item))
       } else {
         console.log('You are not sure');
       }
     });
   }

   $scope.deleteItem = function (item){

     var token =  localStorage.getItem('token');
     var method = "DELETE";
     var url = $rootScope.apiServer + 'distributor/' + item._id + '?token=' + token;
     $ionicLoading.show();
     Server.httpDetails( method, url, '').then(function (response) {
       $ionicLoading.hide();
        if(response.status == 200 ) {
          $cordovaToast.show('A Distributor is removed', 'long', 'center').then(function(success) {
               $scope.getProductData();
            }, function (error) {
           });
        }else {
            $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
        }
      }).catch(function(error) {
        $ionicLoading.hide();
         $cordovaDialogs.alert(error.data, 'Error!', 'OK');
      });
    }

   $scope.viewDistributorDetail = function(item){
     $state.go('app.distributor-detail', {item: item});
   }
})

.controller('DistributorAddCtrl', function($scope, $rootScope, $stateParams, $ionicLoading, $ionicHistory, $cordovaToast, $cordovaDialogs, Server) {
    var loading = function() {
       $ionicLoading.show({
           template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
           '<br/><p>Processing...</p>'
       });
    }

    var token = localStorage.getItem('token')
    var distributor = $stateParams.item;
    if(distributor._id){
      $scope.distributor = distributor;
    } else{
      $scope.distributor = {};
    }

    $scope.uploadFile = function(file){

      console.log('upload-img', file);
      $ionicLoading.show();
      var inputConfig = {
        bucket: 'wtcb/ticket',
        access_key: 'AKIAJNHK7OBATDPIEJJA',
        secret_key: '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'
       };
       AWS.config.update({ accessKeyId: inputConfig.access_key, secretAccessKey: inputConfig.secret_key });
       AWS.config.region = 'us-east-2';
       var bucket = new AWS.S3({ params: { Bucket: inputConfig.bucket } });
       var filename = new Date().getTime() + file.name;
       var params = { Key: filename, ContentType: file.type,  Body: file, ACL: 'public-read', ServerSideEncryption: 'AES256'};
       bucket.putObject(params, function (err, data) {
         $ionicLoading.hide();
         if (err) {
         } else {
           var object = {
             url: 'https://s3-us-east-2.amazonaws.com/wtcb/ticket/' + filename
           };
           $scope.distributor.image =  object.url;
           console.log($scope.distributor.image);
         }
       })
     }

    $scope.addDistributor = function(){

      $ionicLoading.show();
      $scope.distributor.token = token;
      var url = $rootScope.apiServer + 'distributor';
      var method = "POST";
      Server.httpDetails( method, url, $scope.distributor).then(function (response) {
        $ionicLoading.hide();
           if(response.status == 200 ) {
             $cordovaToast.show('A Distributor is created', 'long', 'center').then(function(success) {
                  $ionicHistory.goBack();
               }, function (error) {
              });

           }else {
              $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
           }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert(error.data, 'Error!', 'OK');
       });
    }

    $scope.editDistributor = function(){

      var url = $rootScope.apiServer + 'distributor/' + $scope.distributor._id;
      var method = "PATCH";
      var disData = { "token": token, "name": $scope.distributor.name, "image":$scope.distributor.image,
                      "phone": $scope.distributor.phone, "distributor_email": $scope.distributor.distributor_email,
                      "fax": $scope.distributor.fax, "address": $scope.distributor.address,
                      "city": $scope.distributor.city, "state": $scope.distributor.state,
                      "zip": $scope.distributor.zip, "sales_name": $scope.distributor.sales_name,
                      "sales_phone": $scope.distributor.sales_phone, "sales_email": $scope.distributor.sales_email 
                    }
      $ionicLoading.show();
      Server.httpDetails( method, url, disData).then(function (response) {
        $ionicLoading.hide();
           if(response.status == 200 ) {
             $cordovaToast.show('A Distributor is updated', 'long', 'center').then(function(success) {
                  $ionicHistory.goBack();
               }, function (error) {
              });

           }else {
              $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
           }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert(error.data, 'Error!', 'OK');
       });
    }
})

.controller('DistributorDetailCtrl', function($scope, $state, $stateParams) {
  var distributor = $stateParams.item;
  $scope.distributor = distributor;

  $scope.editDistributor = function(){
    $state.go('app.distributor-add', {item: distributor})
  }

})

.controller('EmployeesDisCtrl', function($scope) {


})

.controller('EmployeeAddCtrl', function($scope) {

})
//Product Details Page

.controller('ProductListCtrl', function($scope, $state, $stateParams, $rootScope, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaDialogs, Server) {

  var loading = function() { $ionicLoading.show({
    template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }

  $scope.input = [];

  $scope.$on("$ionicView.beforeEnter", function(event) {

      $scope.selectKey = $stateParams.key;

      $scope.getProductData();
  })

  var token =  localStorage.getItem('token');
  $scope.getProductData = function (){
    $ionicLoading.show();
    var method = "GET";
    var url = $rootScope.apiServer + 'product?token=' + token;

    Server.httpDetails( method, url, '').then(function (response) {
      $ionicLoading.hide();
       if(response.status == 200 ) {
         $scope.productData = response.data;
       }else {
           $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
   }

     $scope.checkItems = {}
     $scope.print = function() {
     }

     $scope.saveSelectProductItem = function(){
       var array = [];
       for(i in $scope.checkItems) {
           if($scope.checkItems[i] == true) {
               array.push(i);
           }
        }
      }

     $scope.deleteProduct = function(item) {
       var confirmPopup = $ionicPopup.confirm({
         title: 'Warning',
         template: 'Are you sure you want to delete this item?'
       });

       confirmPopup.then(function(res) {
         if(res) {
           console.log($scope.deleteItem(item))
         } else {
           console.log('You are not sure');
         }
       });
     };

     $scope.deleteItem = function (item){
       var method = "DELETE";
       var url = $rootScope.apiServer + 'product/' + item._id + '?token=' + token;

       $ionicLoading.show();
       Server.httpDetails( method, url, '').then(function (response) {
         $ionicLoading.hide();
          if(response.status == 200 ) {
            $cordovaToast.show('A Product is deleted', 'long', 'center').then(function(success) {
                 $scope.getProductData();
              }, function (error) {
             });
          }else {
              $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
          }
        }).catch(function(error) {
          $ionicLoading.hide();
           $cordovaDialogs.alert(error.data, 'Error!', 'OK');
        });
      }

    $scope.showOptions = false;

    $scope.showFilterOptions = function(){
      $scope.showOptions = !$scope.showOptions;
    }

    $scope.addProduct = function(){
      $state.go('app.product-add', {key:'Add'});
    }

    $scope.editProduct = function(item){
      $state.go('app.product-add', {item: item});
    }
    $scope.viewProductDetail = function(item){
      $state.go('app.product-detail', {item: item});
    }
})



.controller('ProductDetailCtrl', function($scope, $ionicModal, $state, $stateParams, $rootScope, $cordovaDialogs, $ionicLoading, $stateParams, $filter, Server) {

  $scope.materiallists = [

    { name: 'Wood', value:1 },
    { name: 'Marble', value: 2 },
    { name: 'Tile', value: 3 },
    { name: 'Ceramic', value: 4 },
    { name: 'Grantie', value: 5 },
    { name: 'Contret', value: 6 },
    { name: 'Carpet', value: 7 },
    { name: 'Other', value: 8 }
  ];


  $scope.$on("$ionicView.beforeEnter", function(event) {

      $scope.getDistributorData();
      $scope.getClientData();
  });

  $scope.getDistributorData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'distributor?token=' + token;

    Server.httpDetails( method, url, '').then(function (response) {
      $ionicLoading.hide();
       if(response.status == 200 ) {
         $scope.distributorlist = response.data;

         if($scope.product.distributor_id){
           var distributor = $filter('filter')($scope.distributorlist, { _id: $scope.product.distributor_id});
           $scope.distributor =  distributor[0];
         }else{
           $scope.distributor = '';
         }
       }else {
          $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
   }

   $scope.getClientData = function(){

    $ionicLoading.show();
    var token = localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'client?token=' + token;
    var data = '';

    Server.httpDetails( method, url, data).then(function (response) {
         if(response.status == 200 ) {
            $ionicLoading.hide();
            $scope.clientsList = response.data;

            var clients = $stateParams.item;

            $scope.sortClients = [];
            var clients = clients.client_ids;
            $scope.sortClients = $scope.clientsList.filter(function(client) {
              return clients.indexOf(client._id) > -1;
           });
         }else {
            $ionicLoading.hide();
             $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
         }
     });
  }

  $scope.cal = {
     qunantity:0, total:0
  }

  $scope.product = $stateParams.item;

  if($scope.product.material){
    var material = $filter('filter')($scope.materiallists, {value: $scope.product.material});
    $scope.material =  material[0].name;
  }else{
    $scope.material = '';
  }
  $scope.qrCode = { name: $scope.product.name, distributor_id: $scope.product.distributor_id,
                    material:$scope.product.material, project: '0', min_order_size: $scope.product.min_order_size,
                    available: $scope.product.available, cost:$scope.product.cost, protection: $scope.product.protection,
                    material_fiber:$scope.product.material_fiber,pattern: $scope.product.pattern,
                    unit: $scope.product.unit, mark_up_percent:$scope.product.mark_up_percent, 
                    length:$scope.product.length, width:$scope.product.width, area:$scope.product.area,
                    min_shipping_cost:$scope.product.min_shipping_cost, flat_fee:$scope.product.flat_fee,
                    price:$scope.product.price, image:$scope.product.image 
                  }

  var price =($scope.product.cost * 1) + ($scope.product.cost * 1) * ($scope.product.mark_up_percent * 1) / 100;
  $scope.price = price.toFixed(2)

  $scope.addClient = function(){
    $state.go('app.client-list', { key:'client', id: $scope.product._id, clients: $scope.sortClients});
  }

  $scope.goClientDetailPage = function(item){
      $state.go('app.client-detail', { item: item});
  }

  $scope.editProduct = function(){
    $state.go('app.product-add', { item: $scope.product, key: $scope.product.name});
  }

  $scope.calTotal = function(){
    $scope.cal.total = $scope.product.min_order_size * $scope.cal.qunantity;
  }

})

.controller('ProductAddCtrl', function($scope, $stateParams, $rootScope, $ionicModal, $timeout, $ionicHistory, $cordovaDialogs, $ionicLoading, $ionicActionSheet, $cordovaCamera, Server, $filter) {

  var token = localStorage.getItem('token');
  $scope.materiallists = [
    { name: 'Wood', value:1 },
    { name: 'Marble', value: 2 },
    { name: 'Tile', value: 3 },
    { name: 'Ceramic', value: 4 },
    { name: 'Grantie', value: 5 },
    { name: 'Contret', value: 6 },
    { name: 'Carpet', value: 7 },
    { name: 'Other', value: 8 }
  ];

  $scope.costlists = [
    { name: 'SQ.FT.', value:1 },
    { name: 'SQ.INCH', value: 2 },
    { name: 'BUNDLE', value: 3 },
    { name: 'YARD', value: 4 }
  ];

  $scope.available = { checked: false };

  var productData = $stateParams.item;
  $scope.pageKey = $stateParams.key;

  if(productData.name){
    $scope.product = { token: token, name: productData.name, color: productData.color, material: productData.material,
                        sku_num: productData.sku_num, min_order_size: productData.min_order_size, project: '0',
                        distributor_id: productData.distributor_id, available: productData.available, protection: productData.protection,
                        warr_info: productData.warr_info, cost: productData.cost, mark_up_percent: productData.mark_up_percent,
                        meterial_fiber: productData.material_fiber, length: productData.length, width: productData.width,
                        pattern: productData.pattern, area: productData.area, unit: productData.unit,
                        min_shipping_cost: productData.min_shipping_cost, flat_fee: productData.flat_fee,
                        price: productData.price, image: productData.image
                      };

    if($scope.product.material){
      var material = $filter('filter')($scope.materiallists, {value: $scope.product.material});
      $scope.material =  material[0];
    }else{
      $scope.material = '';
    }

    var costItem = $filter('filter')($scope.costlists, {value: $scope.product.unit});
    if($scope.product.unit){
      $scope.costItem =  costItem[0];
    }else{
      $scope.costItem = '';
    }
  }else {
    $scope.product = {
      token:token , name:'', distributor_id:'', color: '', material:'', project: '',
      warr_info:'', min_order_size:'',protection:'', material_fiber:'', available: false,
      pattern: '', cost:0, mark_up_percent:0, length:'', width:'', area:'',
      min_shipping_cost:'', flat_fee:'', price:'', image:''};
    }

  $scope.getDistributorData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'distributor?token=' + token;

    Server.httpDetails( method, url, '').then(function (response) {
      $ionicLoading.hide();
       if(response.status == 200 ) {

         $scope.distributorlist = response.data;
         if($scope.product.distributor_id){
           var dis = $filter('filter')($scope.distributorlist, { _id: $scope.product.distributor_id});
           $scope.dis =  dis[0];
         }else{
           $scope.dis = '';
          }
       }else {
           $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert('Server Error.', 'Error!', 'OK');
     });
   }

  var loading = function() {
     $ionicLoading.show({
         template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }
  $scope.$on("$ionicView.beforeEnter", function(event) {
      $scope.getDistributorData();
  })

  $scope.selectedDistributor = function(item) {

    $scope.changedDistributor(item, $scope.selectedIndex);
    $timeout(function() {
      $scope.modal.hide();
    }, 1000);
  };

  $scope.changedDistributor = function(value){
    $scope.product.distributor_id = value._id;
    $scope.product_name = value.name;
  };

  // ChangeDistributor Modal Page

  $scope.distributorModal = {
    distributorSide: 'ng'
  };

  $ionicModal.fromTemplateUrl('templates/distributor-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal1 = modal;
  });

  $scope.openDistributorModal = function() {
     $scope.modal1.show();
    };

  $scope.optionDistributor = function() {
    if($scope.product.distributor_id){
      $scope.distributorModal.distributorSide = $scope.distributorlist.find(function(dis) {
        return dis._id == $scope.product.distributor_id;
      });
    } else {
      $scope.distributorModal.distributorSide = {};
    }
    
    $scope.modal1.show();
  };
  $scope.selectedDistributor = function(item) {
    $scope.changedDistributor(item);
    $timeout(function() {
      $scope.modal1.hide();
    }, 1000);
  };

  $scope.cancelDistributor = function() {
    $scope.modal1.hide();
  };



  $scope.changedMaterial = function(value){
      $scope.product.material = value.value;
  };

  $scope.changedProject = function(value){
      $scope.product.project = value.value;
  };

  $scope.changedCostPer = function(value){
      $scope.product.unit = value.value;
  }

  $scope.availableChange = function() {
    $scope.product.available = $scope.available.checked;
  };

  $scope.fiberChange = function() {
    $scope.product.fiber = $scope.fiber.checked;
  };

    $scope.patternChange = function() {
      $scope.product.pattern = $scope.pattern.checked;
    };

   $scope.uploadFile = function(file){

    console.log('file', file);
      $ionicLoading.show();
      var inputConfig = {
        bucket: 'wtcb/ticket',
        access_key: 'AKIAJNHK7OBATDPIEJJA',
        secret_key: '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'
      };
      AWS.config.update({ accessKeyId: inputConfig.access_key, secretAccessKey: inputConfig.secret_key });
      AWS.config.region = 'us-east-2';

      var bucket = new AWS.S3({ params: { Bucket: inputConfig.bucket } });
      var filename = new Date().getTime() + file.name;
      var params = { Key: filename, ContentType: file.type,  Body: file, ACL: 'public-read', ServerSideEncryption: 'AES256'};
      console.log('params', params);

      bucket.putObject(params, function (err, data) {
        $ionicLoading.hide();
        if (err) {
        } else {
          var object = {
            url: 'https://s3-us-east-2.amazonaws.com/wtcb/ticket/' + filename
          };
          $scope.product.image =  object.url;
          console.log($scope.product.image);
        }
      })
    }

    $scope.addProduct = function(){

      var product_price = Number($scope.product.cost) +  Number($scope.product.cost * $scope.product.mark_up_percent / 100)
                              + Number($scope.product.min_shipping_cost) + Number($scope.product.flat_fee) ;
      $scope.product.price = product_price.toString();
      $ionicLoading.show();

      var url;
      var method;
      if($scope.pageKey == 'Add'){
        method = "POST";
        url = $rootScope.apiServer + 'product';
      }else{
        method = "PATCH";
        url = $rootScope.apiServer + 'product/' + productData._id;
      }

      Server.httpDetails( method, url, $scope.product).then(function (response) {
        $ionicLoading.hide();
           if(response.status == 200 ) {
            $ionicHistory.goBack();
           }else {
              $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
           }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert(error.data.message, 'Error!', 'OK');
       });
    }
})


.controller('StoreListCtrl', function($scope, $state, $rootScope, $ionicLoading ,$cordovaDialogs, Server) {

  $scope.$on("$ionicView.beforeEnter", function(event) {
      $scope.getStoreData();
  })

  var loading = function() {
     $ionicLoading.show({
         template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }

  $scope.getStoreData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'store?token=' + token;

    Server.httpDetails( method, url, '').then(function (response) {
      $ionicLoading.hide();

       if(response.status == 200 ) {
         $scope.storeData = response.data;
       }else {
          $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
   }

   $scope.viewStoreDetail = function(item){
     $state.go('app.store-add', {item: item});
   }
})

.controller('StoreAddCtrl', function($scope) {
})

.controller('StoreEditCtrl', function($scope) {
})

.controller('OrderListCtrl', function($scope, $state, $rootScope, $stateParams, $ionicPopup, $ionicLoading ,$cordovaDialogs, $cordovaToast, Server) {

  $scope.$on("$ionicView.beforeEnter", function(event) {
    $scope.getOrderData();
  })

  var loading = function() {
     $ionicLoading.show({
         template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }

  $scope.getOrderData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'order?token=' + token;

    Server.httpDetails( method, url, '').then(function (response) {

      $ionicLoading.hide();

       if(response.status == 200 ) {
         $scope.orderData = response.data;
       }else {
          $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
   }

   $scope.deleteOrder = function(item){
     var confirmPopup = $ionicPopup.confirm({
       title: 'Warning',
       template: 'Are you sure you want to delete this item?'
     });

     confirmPopup.then(function(res) {
       if(res) {
         $scope.deleteItem(item._id);
        } 
     });
   };

   $scope.deleteItem = function (value){

     var token =  localStorage.getItem('token');
     var method = "DELETE";
     var url = $rootScope.apiServer + 'order/' + value + '?token=' + token;
     $ionicLoading.show();
     Server.httpDetails( method, url, '').then(function (response) {
       $ionicLoading.hide();
        if(response.status == 200 ) {
          $cordovaToast.show('A Order is deleted', 'long', 'center').then(function(success) {
              $scope.getOrderData();
            }, function (error) {
          });
        }else {
          $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
        }
      }).catch(function(error) {
        $ionicLoading.hide();
         $cordovaDialogs.alert(error.data, 'Error!', 'OK');
      });
    }

    $scope.checkItems = {}
    $scope.print = function() {
    }

    $scope.saveClientItem = function(){
      var array = [];
      for(i in $scope.checkItems) {
        if($scope.checkItems[i] == true) {
            array.push(i);
        }
      }
    }
   $scope.viewOrderDetail = function(id, item){
     $state.go('app.order-detail', {id: id, item: item});
   }
})

.controller('OrderDetailCtrl', function($scope, $rootScope, $state, $stateParams, $ionicModal, $filter, $ionicHistory, $ionicPopup, $ionicLoading, $cordovaToast , $cordovaDialogs, Server, ionicDatePicker, ionicTimePicker, InvoiceService) {
    $scope.step1 = false;
    $scope.step2 = false;
    $scope.step3 = false;
    $scope.step4 = false;
    $scope.step5 = false;
    $scope.step6 = false;

    var token = localStorage.getItem('token');
    var order_id = $stateParams.id;
    $scope.order = $stateParams.item;
    if($scope.order.step == 0){
      $scope.step1 = true;
    } else if($scope.order.step == 1){
      $scope.step2 = true;
    }  else if($scope.order.step == 2){
      $scope.step3 = true;
    } else if($scope.order.step == 3){
      $scope.step4 = true;
    } else if($scope.order.step == 4){
      $scope.step5 = true;
    }else if($scope.order.step == 5){
      $scope.step6 = true;
    }

    $scope.$on("$ionicView.beforeEnter", function(event) {
        $scope.getData();
    })
    var loading = function() {
       $ionicLoading.show({
           template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
           '<br/><p>Processing...</p>'
       });
    }

    $scope.showStep1 = function(){
      $scope.step1 = !$scope.step1;
    }
    $scope.showStep2 = function(){
      $scope.step2 = !$scope.step2;
    }
    $scope.showStep3 = function(){
      $scope.step3 = !$scope.step3;
    }
    $scope.showStep4 = function(){
      $scope.step4 = !$scope.step4;
    }
    $scope.showStep5 = function(){
      $scope.step5 = !$scope.step5;
    }
    $scope.showStep6 = function(){
      $scope.step6 = !$scope.step6;
    }

    var token = localStorage.getItem('token');

    $scope.getData = function (){
      $ionicLoading.show();
      var method = "GET";
      var url0 = $rootScope.apiServer + 'order/' + order_id + '?token=' + token;
      var url1 = $rootScope.apiServer + 'product?token=' + token;
      var url2 = $rootScope.apiServer + 'client?token=' + token;
      var url3 = $rootScope.apiServer + 'store?token=' + token;
      var url4 = $rootScope.apiServer + 'distributor?token=' + token;

      //  Order List
      Server.httpDetails( method, url0, '').then(function (response) {
        $ionicLoading.hide();
         if(response.status == 200 ) {
           var productData = response.data
           $scope.productData = productData;
           var paymentDate = {};
           }else {
            $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
         }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert(error.data, 'Error!', 'OK');
       });

       //  Client List
       Server.httpDetails( method, url2, '').then(function (response) {
         $ionicLoading.hide();
            if(response.status == 200 ) {
              $scope.clientsList = response.data;
              var clientValue = $filter('filter')($scope.clientsList, {_id: $scope.order.client_id});
              $scope.clientData =  clientValue[0];
            }else {
              $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
            }
        }).catch(function(error) {
          $ionicLoading.hide();
           $cordovaDialogs.alert(error.data, 'Error!', 'OK');
        });

        // Store List
       Server.httpDetails( method, url3, '').then(function (response) {
         $ionicLoading.hide();
          if(response.status == 200 ) {
            $scope.storeData = response.data;
            var store_id = localStorage.getItem('store_id');
            var storeValue = $filter('filter')($scope.storeData, {_id: store_id});
            $scope.storeValue = storeValue[0];
          }else {
              $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
          }
        }).catch(function(error) {
          $ionicLoading.hide();
           $cordovaDialogs.alert(error.data, 'Error!', 'OK');
        });

        //  Product List
       Server.httpDetails( method, url1, '').then(function (response) {
         $ionicLoading.hide();
          if(response.status == 200 ) {
            $scope.productList = response.data;
            $scope.sortProducts = [];
            let sort_products = [];
            sort_products = $scope.productList.filter(function(product) {
              let item = $scope.productData.find(function(product1){
                return product1.product_id == product._id;
              });
              if(item) {
                product.count = item.count;
                return true;
              }
              return false;
            });

            $scope.sortProducts = sort_products;
          }else {
              $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
          }
        }).catch(function(error) {
          $ionicLoading.hide();
           $cordovaDialogs.alert(error.data, 'Error!', 'OK');
        });

        // Distributor Data
        Server.httpDetails( method, url4, '').then(function (response) {
           if(response.status == 200 ) {
             $scope.distributorList = response.data;
           }else {
              $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
           }
         }).catch(function(error) {
           $ionicLoading.hide();
            $cordovaDialogs.alert(error.data, 'Error!', 'OK');
         });
     }

     $scope.getDisData = function(key){
       var dis_value = $filter('filter')($scope.distributorList, {_id: key});
       return dis_value[0];
     }

     var dateObj = {
          callback: function(val) {
              var date = new Date(val);
              var dd = date.getDate();
              var mm = date.getMonth() + 1;
              var yyyy = date.getFullYear();
              dd = dd < 10 ? '0' + dd : dd;
              mm = mm < 10 ? '0' + mm : mm;
              $scope.install_company.date = yyyy + "-" + mm + "-" + dd;
          }
      };

      var timeObj = {
          callback: function(val) {
              var time = new Date(val * 1000);
              if (typeof val == "undefined") {
                  time = new Date();
              }
              var h = time.getHours();
              var m = time.getMinutes();
              h = h < 10 ? '0' + h : h;
              m = m < 10 ? '0' + m : m;
              $scope.install_company.time = h + ":" + m;
          }
      };
      $scope.showDatePicker = function() {
          ionicDatePicker.openDatePicker(dateObj);
      };
      $scope.showTimePicker = function() {
          ionicTimePicker.openTimePicker(timeObj);
      };

      $scope.paymentReceived = { checked:false };
      $scope.itemShipped = { checked:false };
      $scope.itemReceived = { checked:false };
      $scope.shippingTracking = { checked:false };
      $scope.receivingTracking = { checked:false };

      $scope.paymentReceivedChanged = function() {
      };
      $scope.itemShippedChanged = function() {
      };
      $scope.shippingTrackingChanged = function() {
      };
      $scope.itemReceivedChanged = function() {
      };
      $scope.receivingTrackingChanged = function() {
      };

     $scope.uploadFile = function(file){
       $ionicLoading.show();
       var inputConfig = {
          bucket: 'wtcb/ticket',
          access_key: 'AKIAJNHK7OBATDPIEJJA',
          secret_key: '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'
        };

        AWS.config.update({ accessKeyId: inputConfig.access_key, secretAccessKey: inputConfig.secret_key });
        AWS.config.region = 'us-east-2';
        var bucket = new AWS.S3({ params: { Bucket: inputConfig.bucket } });

        var filename = new Date().getTime() + file.name;

        var params = {
          Key: filename,
          ContentType: file.type,
          Body: file,
          ACL: 'public-read',
          ServerSideEncryption: 'AES256'
        };

        bucket.putObject(params, function (err, data) {
          $ionicLoading.hide();
          if (err) {
          } else {
            var object = {
              url: 'https://s3-us-east-2.amazonaws.com/wtcb/ticket/' + filename
            };
            $scope.order.attach_image =  object.url;
            $scope.uploadAttachInvoice($scope.order.attach_image)
          }
        })
      }

  $scope.uploadAttachInvoice = function(value){

    var data = { "token":token, "attach_image": value}
    var url = $rootScope.apiServer + 'order/' + order_id;
    var method = "PATCH";
    Server.httpDetails( method, url, data).then(function (response) {
      $ionicLoading.hide();
         if(response.status == 200 ) {
         }else {
            $cordovaDialogs.alert('Update Error.', 'Error!', 'OK');
         }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
  }

  $scope.orderingConfirm = function(val) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Submit',
      template: 'Are you sure you want to Submit ' + val +' ?'
    });
    confirmPopup.then(function(res) {
      if(res) {
          $scope.orderingSubmit();
      } else {
      }
    });
  };

  $scope.orderingSubmit = function(){
    var data = { "token": token, "step": 1}
    $scope.stepSubmit(data);
  }

  $scope.paymentSubmit = function(){
    if($scope.paymentReceived.checked == true){
      var token = localStorage.getItem('token');
      var data = { "token": token, "step": 2};
      $scope.stepSubmit(data);
    } else {
      $cordovaDialogs.alert("You didn't recieve Payment Email", 'Please check your emailbox', 'OK');
    }
  }

  $scope.shippingSubmit = function(){
    if($scope.itemShipped.checked == false){
      $cordovaDialogs.alert("You didn't check Items Shipped option", 'Please check your items Shipped', 'OK');
    } else if($scope.shippingTracking.checked == false){
        $cordovaDialogs.alert("You didn't check View Tracking #", 'Please check your View Tracking #', 'OK');
    }else{
      var token = localStorage.getItem('token');
      var data = { "token": token, "step": 3, "tracking_no": $scope.order.tracking_no};
      $scope.stepSubmit(data);
    }
  }

  $scope.receivedSubmit = function(){
    if($scope.itemReceived.checked == false){
      $cordovaDialogs.alert("You didn't check Items Received option", 'Please check your items Received', 'OK');
    } else if($scope.receivingTracking.checked == false){
        $cordovaDialogs.alert("You didn't check View Tracking #", 'Please check your View Tracking #', 'OK');
    }else{
      var token = localStorage.getItem('token');
      var data = { "token": token, "step": 4, "tracking_no": $scope.order.tracking_no};
      $scope.stepSubmit(data);
    }
  }

  $scope.deliverySubmit = function(){
    var data = { 'token': token, 'step': 5, 
                  'install_company': {
                    'name': $scope.order.install_company.name,
                    'tech_name': $scope.order.install_company.tech_name,
                    'tech_phone': $scope.order.install_company.tech_phone,
                    'date': $scope.order.install_company.date,
                    'time': $scope.order.install_company.time}
                }
    $scope.stepSubmit(data);
  }

  $scope.stepSubmit = function(data){
    var url = $rootScope.apiServer + 'order/' + order_id;
    var method = "PATCH";
    Server.httpDetails( method, url, data).then(function (response) {
      $ionicLoading.hide();
         if(response.status == 200 ) {
           if(data.step == 5){
             $cordovaDialogs.alert("COMPLETED", "ORDER", "OK");
             $ionicHistory.goBack();
           } else{
             $cordovaToast.show('This Step is Submitted', 'long', 'center').then(function(success) {
                 $ionicHistory.goBack();
               }, function (error) {
              });
           }
         }else {
            $cordovaDialogs.alert('Update Error.', 'Error!', 'OK');
         }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
  }

  setDefaultsForPdfViewer($scope);
  // Initialize the modal view.
  $ionicModal.fromTemplateUrl('templates/pdf-viewer.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function (modal) {
      $scope.modal = modal;
  });

  $scope.viewInvoice = function () {
    var invoice = getDummyData();

    InvoiceService.createPdf(invoice).then(function (pdf) {
      var blob = new Blob([pdf], { type: 'application/pdf' });
      $scope.pdfUrl = URL.createObjectURL(blob);
      $scope.modal.show();
    });
  };

  $scope.$on('$destroy', function () {
      $scope.modal.remove();
  });

  function setDefaultsForPdfViewer($scope) {
     $scope.scroll = 0;
     $scope.loading = 'loading';

     $scope.onError = function (error) {
     };

     $scope.onLoad = function () {
         $scope.loading = '';
     };

     $scope.onProgress = function (progress) {
     };
   }

     function getDummyData() {
       var client = $scope.clientData;
       var store = $scope.storeValue;
       var padding = $scope.order.padding?$scope.order.padding:'';
       var track_script = $scope.order.track_script?$scope.order.track_script:'';
       var glue = $scope.order.glue?$scope.order.glue:'';
       var labor = $scope.order.labor?$scope.order.labor:'';
       var trans_script = $scope.order.trans_script?$scope.order.trans_script:'';
        return {
            Date: new Date().toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" }),
            Information: {
              Address: store.name,
              City:  store.city + ', ' + store.address + ' ' + store.zip,
              Phone: store.phone,
              Email: store.email
            },
            AddressFrom: {
                Name: client.first_name + ' ' + client.last_name,
                Company: client.client_email,
                Address: client.address,
                City: client.city + ' ' + client.state + ' ' + client.zipcode,
                Phone: client.phone
            },
            AddressTo: {
                 Name: 'Minoru',
                 Company:'AlphaVictoria',
                 Address: 'Tokyo-to',
                 City: 'Tokyo, Japan',
                 Phone:'987654321'
            },
            Items: [
                   { Sales_person: 'Name', SKU: '', Description: '', Color:'', Price:'', Cost:'', Total: '' },
               ],
           Item2s: $scope.sortProducts,
           padding: padding,
           tack_script: track_script,
           glue: glue,
           labor: labor,
           trans_script: trans_script,

           discount: $scope.order.discount,
           shipping_fee: $scope.order.shipping_fee,
           sales_tax: $scope.order.sales_tax,
           Total: $scope.order.total_price,
        };
    }

  $scope.editInvoice = function(){

    $state.go('app.edit-invoice', {order:$scope.order, client: $scope.clientData,
                        store: $scope.storeValue, products: $scope.sortProducts});
  }

  $scope.disInvoicePage = function(group){
    $state.go('app.distributor-invoice', { order:$scope.order, store: $scope.storeValue, group: group});
  }
})

.controller('EditInvoiceCtrl', function($scope, $stateParams, $rootScope, $stateParams, $ionicModal, $ionicHistory, $ionicPopup, $ionicLoading, $cordovaDialogs, $cordovaEmailComposer, InvoiceService, Server) {

  $scope.order = $stateParams.order;
  $scope.clientData = $stateParams.client;
  $scope.storeValue = $stateParams.store;
  $scope.products = $stateParams.products;
  $scope.productData = $stateParams.productData;
  if($scope.order.ship_info){
    $scope.ship_info = $scope.order.ship_info;
  }else{
    $scope.ship_info = { name:'', company:'', addresss:'', city:'', zipcode:'', phone:''};
  }
  $scope.store_fullAddress = $scope.storeValue.city + ', ' + $scope.storeValue.address + ' ' + $scope.storeValue.zip;
  $scope.sold_fullName = $scope.clientData.first_name + ' ' + $scope.clientData.last_name;

  setDefaultsForPdfViewer($scope);

  $ionicModal.fromTemplateUrl('templates/pdf-viewer.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.viewInvoiceData = function(val){
    var shipInfo = $scope.ship_info;
    if(shipInfo.name == '' || shipInfo.company == '' || shipInfo.address == '' || shipInfo.city == '' || shipInfo.zipcode == '' || shipInfo.phone == ''){
      $cordovaDialogs.alert('Please fill Ship Infoformation', 'Alert!', 'OK');
    }else if(val == 'download'){
      $scope.downloadPDF();
    }else if(val == 'view'){
      $scope.viewInvoice();
    }
  }

  $scope.viewInvoice = function () {

    var token = localStorage.getItem('token');
    var data = { 'token': token, 'ship_info': $scope.ship_info }
    var url = $rootScope.apiServer + 'order/' + $scope.order._id;
    var method = "PATCH";

    Server.httpDetails( method, url, data).then(function (response) {
      $ionicLoading.hide();
         if(response.status == 200 ) {
         }else {
            $cordovaDialogs.alert('Update Error.', 'Error!', 'OK');
         }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });

      var invoice = getDummyData();

      InvoiceService.createPdf(invoice).then(function (pdf) {
          var blob = new Blob([pdf], { type: 'application/pdf' });
          $scope.pdfUrl = URL.createObjectURL(blob);
          $scope.modal.show();
      });
  };

    $scope.downloadPDF = function() {
      var invoice = getDummyData();
      $ionicLoading.show();
      InvoiceService.downloadPdf(invoice, 'Invoice').then(function(res) {
          $ionicLoading.hide();
          $scope.file_url = res;
          $cordovaDialogs.alert(res + ' created successfully!', 'Success', 'OK');
      }, function(err) {
          $ionicLoading.hide();
          $cordovaDialogs.alert(err, 'Error!', 'OK');
      })
    }

    $scope.sendingEmail= function() {
      var attach_url = $scope.file_url;
      var email = {
        to: $scope.clientData.client_email,
        subject: 'INVOICE',
        attachments: [
          attach_url
        ],
        isHtml: true
      };
      $cordovaEmailComposer.open(email).then(null, function () {
      });
    }

    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });

    function setDefaultsForPdfViewer($scope) {
       $scope.scroll = 0;
       $scope.loading = 'loading';

       $scope.onError = function (error) {
       };

       $scope.onLoad = function () {
           $scope.loading = '';
       };

       $scope.onProgress = function (progress) {
       };
     }

     function getDummyData() {
       var client = $scope.clientData;
       var store = $scope.storeValue;
       var ship_info = $scope.ship_info;
       var padding = $scope.order.padding?$scope.order.padding:'';
       var track_script = $scope.order.track_script?$scope.order.track_script:'';
       var glue = $scope.order.glue?$scope.order.glue:'';
       var labor = $scope.order.labor?$scope.order.labor:'';
       var trans_script = $scope.order.trans_script?$scope.order.trans_script:'';

        return {
            Date: new Date().toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" }),
            Information: {
              Address: store.name,
              City:  store.city + ', ' + store.address + ' ' + store.zip,
              Phone: store.phone,
              Email: store.email
            },
            AddressFrom: {
                Name: client.first_name + ' ' + client.last_name,
                Company: client.client_email,
                Address: client.address,
                City: client.city + ' ' + client.state + ' ' + client.zipcode,
                Phone: client.phone
            },
            AddressTo: {
                 Name: ship_info.name,
                 Company:ship_info.company,
                 Address: ship_info.address,
                 City: ship_info.city + ' ' + ship_info.zipcode,
                 Phone: ship_info.phone
            },
            Items: [
                   { Sales_person: "Name", SKU: "", Description: "", Color:"", Price:"", Cost:"", Total: "" },
               ],
           Item2s: $scope.products,
           padding: padding,
           tack_script: track_script,
           glue: glue,
           labor: labor,
           trans_script: trans_script,

           discount: $scope.order.discount,
           shipping_fee: $scope.order.shipping_fee,
           sales_tax: $scope.order.sales_tax,
           Total: $scope.order.total_price,
        };
    }

})

.controller('OrderAddCtrl', function($scope, $state, $stateParams, $ionicModal, $ionicLoading, $cordovaDialogs, $ionicHistory, $rootScope, _, Server, ionicDatePicker, $timeout) {

  var token = localStorage.getItem('token');
  $scope.clientData = $stateParams.item;

  console.log('cleintData', $scope.clientData);

  $scope.order = {token: token, client_id: $scope.clientData._id, date:'', due_date:'', total_price:0, discount:0, shipping_fee: 0, sales_tax:0, message:'', step: 0,
                  products : [{product_id:'', product_name:'', product_image:'', cost:0, count:0, total:0}] }

  $scope.$on("$ionicView.beforeEnter", function(event) {
      $scope.getData();
  })
  var loading = function() {
     $ionicLoading.show({
         template: '<ion-spinner style="fill: #fff" icon="bubbles"></ion-spinner>' +
         '<br/><p>Processing...</p>'
     });
  }

  var token = localStorage.getItem('token');

  $scope.getData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url1 = $rootScope.apiServer + 'product?token=' + token;
    var url2 = $rootScope.apiServer + 'client?token=' + token;

    Server.httpDetails( method, url1, '').then(function (response) {
      $ionicLoading.hide();
       if(response.status == 200 ) {
         $scope.productlists = response.data;
       }else {
          $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });

     $ionicLoading.show();
     Server.httpDetails( method, url2, '').then(function (response) {
       $ionicLoading.hide();
          if(response.status == 200 ) {
            $scope.clientsList = response.data;
          }else {
            $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
          }
      }).catch(function(error) {
        $ionicLoading.hide();
         $cordovaDialogs.alert(error.data, 'Error!', 'OK');
      });
   }

  $scope.addorder = {duedate:'', date:''}

  var formatDate = function(date) {
      var retVal = '';
      var d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      retVal = [year, month, day].join('-');
      return retVal;
  }

  $scope.items = [{id:0, title: "Sales Tax", model:0, modeltitle:"sales_tax", show: true}, {id:1, title: "Discount", model:0, modeltitle:"discount", show: true},
                {id:2, title: "Shipping Fee", model:0, modeltitle:"shipping_fee", show: true}];

  $rootScope.newitems = [{id:3, title: "Padding", model:0, modeltitle:"padding", show: false},
                {id:4, title: "Tack Strip", model:0, modeltitle:"track_script", show: false},
                {id:5, title: "Glue", model:0, modeltitle:"glue", show: false},
                {id:6, title: "Labor", model:0, modeltitle:"labor", show: false},
                {id:7, title: "Transition Strips", model:0, modeltitle:"trans_script", show: false}];

  

  var date1 = {
       callback: function(val) {
           var date = new Date(val);  var dd = date.getDate();
           var mm = date.getMonth() + 1; var yyyy = date.getFullYear();
           dd = dd < 10 ? '0' + dd : dd;  mm = mm < 10 ? '0' + mm : mm;
           var newDate = yyyy + "-" + mm + "-" + dd;
           $scope.addorder.date = newDate;
       }
   };
   var date2 = {
       callback: function(val) {
         var date = new Date(val); var dd = date.getDate();
         var mm = date.getMonth() + 1; var yyyy = date.getFullYear();
         dd = dd < 10 ? '0' + dd : dd; mm = mm < 10 ? '0' + mm : mm;
         var newDate = yyyy + "-" + mm + "-" + dd;
         $scope.addorder.duedate = newDate;
       }
   };

   $scope.showDatePicker = function() {
       ionicDatePicker.openDatePicker(date1);
   };
   $scope.showDuedatePicker = function() {
       ionicDatePicker.openDatePicker(date2);
   };

   $scope.changedClient = function(value){
    $scope.order.client_id= value._id;
    $scope.client_name = value.first_name;
    console.log('client', value)
  };

  $scope.changedProduct = function(value, index){
      $scope.order.products[index] = { product_id: value._id, distributor_id: value.distributor_id,
                product_name: value.name, cost: parseFloat(value.cost)}
      $scope.onPriceChange();
  };

 
// Client Modal
  $scope.clientModal = {
    clientSide: 'ng'
  };

  $ionicModal.fromTemplateUrl('templates/client-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal1 = modal;
  });

  $scope.openClientModal = function() {
     $scope.modal1.show();
    };

  $scope.optionClient = function() {
    if($scope.order.client_id){
      $scope.clientModal.clientSide = $scope.clientsList.find(function(client) {
        return client._id == $scope.order.client_id;
      });
    } else {
      $scope.clientModal.serverSide = {};
    }
    
    $scope.modal1.show();
  };
  $scope.selectedClient = function(item) {
    $scope.changedClient(item);
    $timeout(function() {
      $scope.modal1.hide();
    }, 1000);
  };

  $scope.cancelClient = function() {
    $scope.modal1.hide();
  };
  
  // Product Modal
  $scope.productModal = {
    clientSide: 'ng'
  };

  $scope.selectedIndex = -1;

  $scope.selectedProduct = function(item) {
    $scope.changedProduct(item, $scope.selectedIndex);
    $timeout(function() {
      $scope.modal2.hide();
    }, 1000);
  };

  $ionicModal.fromTemplateUrl('templates/product-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal2 = modal;
  });
  
  $scope.cancelProduct = function() {
    $scope.modal2.hide();
  };
  
  $scope.optionProduct = function(index) {
    $scope.selectedIndex = index;
    if($scope.order.products[index].product_id) {
      $scope.productModal.serverSide = $scope.productlists.find(function(product) {
        return product._id == $scope.order.products[index].product_id;
      });
    } else {
      $scope.productModal.serverSide = {};
    }
    $scope.modal2.show();
  };

  $scope.selectedProduct = function(item) {
    $scope.changedProduct(item, $scope.selectedIndex);
    $timeout(function() {
      $scope.modal2.hide();
    }, 1000);
  };

  $scope.onPriceChange = function() {
    $scope.order.total_price = 0;
    $scope.order.products.map((product)=> {
      $scope.order.total_price += product.count*product.cost;
    });
    $scope.items.map((item)=> {
      if(item.model && item.id !=0) {
        $scope.order.total_price+=item.model;
      }
    });

    $rootScope.newitems.map((item)=> {
      if(item.model) {
        $scope.order.total_price+=item.model;
      }
    });
    if($scope.items[0].model) {
      $scope.order.total_price = $scope.order.total_price + $scope.order.total_price*$scope.items[0].model/100;
    }
  }

  $scope.addProduct = function() {
    var newProduct = {product_id:'', product_name:'', product_image:'',  cost:0, count:0, total:0};
    $scope.order.products = $scope.order.products.concat(newProduct);
  }

  $scope.addItem = function() {
    $state.go('app.add-item', {bb: 'a'});
  }

  $scope.saveOrder = function() {
      $scope.order.date = formatDate($scope.addorder.date);
      $scope.order.due_date = formatDate($scope.addorder.duedate);

      var newOrder = _.clone($scope.order);
      $scope.items.map((item)=> {
        if(item.model) {
          newOrder[item.modeltitle] = item.model;
        }
      });

      $rootScope.newitems.map((item)=> {
        if(item.model) {
          newOrder[item.modeltitle] = item.model;
        }
      });

      console.log('newOrder', newOrder);
      $ionicLoading.show();
      var url = $rootScope.apiServer + 'order';
      var method = "POST";
      Server.httpDetails( method, url, newOrder).then(function (response) {
        $ionicLoading.hide();
           if(response.status == 200 ) {
             $ionicHistory.goBack();
           }else {
              $cordovaDialogs.alert('Register Error.', 'Error!', 'OK');
           }
       }).catch(function(error) {
         $ionicLoading.hide();
          $cordovaDialogs.alert('Server Error.', 'Error!', 'OK');
       });
  }

  $scope.goBack = function(){
    $ionicHistory.goBack();
  }

  $scope.goSelectProduct = function(){
    $state.go('app.product-list', { key:'option'});
  }

})

.controller('DistributorInvoiceCtrl', function($scope, $stateParams, $rootScope, $ionicModal, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaEmailComposer, $cordovaDialogs, $filter, Server, DistributorInvoiceService, Server) {

  $scope.$on("$ionicView.beforeEnter", function(event) {
    $scope.group = $stateParams.group;
    $scope.id = $scope.group[0].distributor_id;
    $scope.order = $stateParams.order;
    $scope.storeValue = $stateParams.store;
    if($scope.order.ship_info){
      $scope.ship_info = $scope.order.ship_info;
    }else{
        $scope.ship_info = { name:'', company:'', addresss:'', city:'', zipcode:'', phone:''};
    }

    $scope.getDistributorData();
  })

  $scope.getDistributorData = function (){
    $ionicLoading.show();
    var token =  localStorage.getItem('token');
    var method = "GET";
    var url = $rootScope.apiServer + 'distributor?token=' + token;
    Server.httpDetails( method, url, '').then(function (response) {
      $ionicLoading.hide();
       if(response.status == 200 ) {
         var dis_value = $filter('filter')(response.data, {_id: $scope.id});
         $scope.distributor = dis_value[0];
       }else {
          $cordovaDialogs.alert('Get Error.', 'Error!', 'OK');
       }
     }).catch(function(error) {
       $ionicLoading.hide();
        $cordovaDialogs.alert(error.data, 'Error!', 'OK');
     });
   }

   setDefaultsForPdfViewer($scope);

   $ionicModal.fromTemplateUrl('templates/pdf-viewer.html', {
       scope: $scope,
       animation: 'slide-in-up'
   }).then(function (modal) {
       $scope.modal = modal;
   });

   $scope.viewInvoice = function () {

     var token = localStorage.getItem('token');
     var data = { 'token': token, 'ship_info': $scope.ship_info }
     var url = $rootScope.apiServer + 'order/' + $scope.order._id;
     var method = "PATCH";

     Server.httpDetails( method, url, data).then(function (response) {
       $ionicLoading.hide();
          if(response.status == 200 ) {
          }else {
             $cordovaDialogs.alert('Update Error.', 'Error!', 'OK');
          }
      }).catch(function(error) {
        $ionicLoading.hide();
         $cordovaDialogs.alert(error.data, 'Error!', 'OK');
      });

     var invoice = getDummyData();

     DistributorInvoiceService.createPdf(invoice).then(function (pdf) {
         var blob = new Blob([pdf], { type: 'application/pdf' });
         $scope.pdfUrl = URL.createObjectURL(blob);
         $scope.modal.show();
     });
    };


    $scope.viewInvoiceData = function(val){
      var shipInfo = $scope.ship_info;
      if(shipInfo.name == '' || shipInfo.company == '' || shipInfo.address == '' || shipInfo.city == '' || shipInfo.zipcode == '' || shipInfo.phone == ''){
        $cordovaDialogs.alert('Please fill Ship Infoformation', 'Alert!', 'OK');
      }else if(val == 'download'){
        $scope.downloadPDF();
      }else if(val == 'view'){
        $scope.viewInvoice();
      }
    }

   $scope.downloadPDF = function() {
     var invoice = getDummyData();
     $ionicLoading.show();
     DistributorInvoiceService.downloadPdf(invoice, 'Distributor Invoice').then(function(res) {
         $ionicLoading.hide();
         $scope.file_url = res;
         $cordovaDialogs.alert(res + ' created successfully!', 'Success', 'OK');
     }, function(err) {
         $ionicLoading.hide();
         $cordovaDialogs.alert(err, 'Error!', 'OK');
     })
   }

   $scope.sendingEmail= function() {
     var attach_url = $scope.file_url;
     var email = {
       to: $scope.distributor.sales_email,
       subject: 'DISTRIBUTOR INVOICE',
       attachments: [
         attach_url
       ],
       isHtml: true
     };
     $cordovaEmailComposer.open(email).then(null, function () {
     });
   }

     $scope.$on('$destroy', function () {
         $scope.modal.remove();
     });

     function setDefaultsForPdfViewer($scope) {
        $scope.scroll = 0;
        $scope.loading = 'loading';

        $scope.onError = function (error) {
        };

        $scope.onLoad = function () {
            $scope.loading = '';
        };

        $scope.onProgress = function (progress) {
        };
      }

    function getDummyData() {
      var distributor = $scope.distributor;
      var store = $scope.storeValue;
      var ship_info = $scope.ship_info;
      var padding = $scope.order.padding?$scope.order.padding:'';
      var track_script = $scope.order.track_script?$scope.order.track_script:'';
      var glue = $scope.order.glue?$scope.order.glue:'';
      var labor = $scope.order.labor?$scope.order.labor:'';
      var trans_script = $scope.order.trans_script?$scope.order.trans_script:'';

       return {
           Date: new Date().toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" }),
           Information: {
             Address: store.name,
             City:  store.city + ', ' + store.address + ' ' + store.zip,
             Phone: store.phone,
             Email: store.email
           },
           AddressFrom: {
               Name: distributor.name ,
               Company: distributor.distributor_email,
               Address: distributor.address,
               City: distributor.city + ' ' + distributor.state + ' ' + distributor.zip,
               Phone: distributor.phone
           },
           AddressTo: {
                Name: ship_info.name,
                Company:ship_info.company,
                Address: ship_info.address,
                City: ship_info.city + ' ' + ship_info.zipcode,
                Phone: ship_info.phone
           },

          Item2s: $scope.group,

       };
   }
})

.controller('AddItemCtrl', function($scope, $stateParams, $ionicHistory) {

   $scope.onItemChange = function(item) {
     if(!item.show) {
       item.model = '';
     }
   }
   $scope.goBack = function(){
     $ionicHistory.goBack();
   }

})

.controller('ProjectSelectCtrl', function($scope, $state, $ionicHistory, $ionicNavBarDelegate) {

  $scope.projectlists = [
    { name: 'Bedroom', value:1 },
    { name: 'Kitchen', value: 2 },
    { name: 'Bath', value: 3 },
    { name: 'Living', value: 4 },
    { name: 'Entrance', value: 5 },
    { name: 'Atrium', value: 6},
    { name: 'Garden', value: 7 },
    { name: 'Other', value: 8 }
  ];

  $scope.checkItems = {}
  $scope.print = function() {
  }

  $scope.saveProjectItem = function(){

    var array = [];
    for(i in $scope.checkItems) {  
      if($scope.checkItems[i] == true) {
        array.push(i);
      }
    }
  $rootScope.array = array
  $ionicHistory.goBack()
  }
})

.controller('ControlPanelCtrl', function($scope, $http, $ionicLoading, $cordovaCamera, $cordovaCapture, $cordovaFileTransfer) {
  
  var options = {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.CAMERA,
    allowEdit: true,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 100,
    targetHeight: 100,
    popoverOptions: CameraPopoverOptions,
    saveToPhotoAlbum: false,
    correctOrientation: true
  };

  $scope.selectPicture = function () {

    console.log('camera');

    $cordovaCamera.getPicture(options).then(function (imageData) {
      var image = document.getElementById('myImage');
      image.src = "data:image/jpeg;base64," + imageData;
    }, function (err) {
      // error
    });
  }

})

.controller('SettingCtrl', function($scope) {

})
