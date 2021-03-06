
angular
  .module('livepoll')
  .controller('EventCtrl', EventCtrl)

function EventCtrl($scope, $state, theEvent, $rootScope, $interval, AuthService, loggedInUser, EventFactory, UserFactory, chartData) {

  var vm=this;
  vm.event=theEvent;
  vm.data=chartData;
  vm.user=loggedInUser;
  vm.guesses=1000;
  vm.order = {};
  vm.order.amtChoice=100;
  vm.openGuesses = [];
  vm.guessOptions=[];
  var guessObj=vm.event.choices;

  vm.clearVotes = function() {
    updateGuessCount(1000);
  }

  vm.noMoreGuesses = function() {
    if (vm.guesses-vm.order.amtChoice < 0)
    return true;
  }

  vm.userCheck = function() {
    if (vm.user.email === "mb@mb.com") return true;
    else return false;
  }

  if (!vm.user.score) vm.user.score=0;

    vm.options = {
      chart: {
          type: 'lineChart',
          interpolate: 'basis',
          height: 450,
          margin : {
              top: 20,
              right: 20,
              bottom: 40,
              left: 55
          },
          x: function(d){ return d.x; },
          y: function(d){ return d.y; },
          useInteractiveGuideline: true,
          dispatch: {
              stateChange: function(e){ console.log("stateChange"); },
              changeState: function(e){ console.log("changeState"); },
              tooltipShow: function(e){ console.log("tooltipShow"); },
              tooltipHide: function(e){ console.log("tooltipHide"); }
          },
          xAxis: {
              axisLabel: 'Time',
              tickFormat: function(d) {
                return d3.time.format('%m/%d %H:%M%p')(new Date(d));
              }
          },
          yAxis: {
              axisLabel: 'Vote Value',
              tickFormat: function(d){
                  return d3.format('.02f')(d);
              },
              axisLabelDistance: -10
          },
          callback: function(chart){
              console.log("!!! lineChart callback !!!");
          }
      },
      title: {
          enable: true,
          text: 'Projected Winner'
      },
      subtitle: {
          enable: false,
          text: 'Subtitle for simple line chart.',
          css: {
              'text-align': 'center',
              'margin': '10px 13px 0px 7px'
          }
      },
      caption: {
          enable: false,
          html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet.',
          css: {
              'text-align': 'justify',
              'margin': '10px 13px 0px 7px'
          }
      }
  };

    for (var key in theEvent.choices) {
      vm.guessOptions.push(key)
    }

    //persisting chart data
    if (guessObj) {
      for (var x=0; x<vm.data.length; x++) {
        vm.data[x].values=guessObj[vm.data[x].key];
      }
    }

  vm.submitGuess = function(order) {

    vm.openGuesses.push({option: order.optionChoice, amt: order.amtChoice});
    vm.guesses-=order.amtChoice;
    updateGuessCount(vm.guesses);
    var totalGuessVal=Number(order.amtChoice);

    chartData.forEach(function(el) {
      totalGuessVal+=el.values[el.values.length-1].y;
    });

    vm.data.forEach(el => {
      if (el.key===order.optionChoice) {
        el.values.push({
          x: Date.now(),
          y: (el.values[el.values.length-1].y+Number(order.amtChoice))
        })
      } else {
        el.values.push({
        x:Date.now(),
        y:(el.values[el.values.length-1].y)
      })
    }
    guessObj[el.key].push(el.values[el.values.length-1]);
  });

    EventFactory.submitGuess(vm.event._id,guessObj);
    order={};
  }

  function updateGuessCount(num) {
      var newObj={}
      var key=vm.event.path;
      newObj[key]=num;
      UserFactory.editUser(vm.user._id, {guesses: newObj});
      vm.guesses=num;
    };

}
