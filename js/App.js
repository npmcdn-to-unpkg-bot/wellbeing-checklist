import React from 'react';
import ReactDOM from 'react-dom';
import {ReactFire, ReactFireMixin} from 'reactfire';
import ReactMixin from 'react-mixin';


// Setup Dates
var today = new Date();
var first = new Date(today.getFullYear(), 0, 1);
var theDay = today.getDay();
var theYear = today.getFullYear();
var theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + .5, 0);
var dateMarker = theDay.toString() + "-" + theYear;

//
// Setup Firebase
//
// Configure Firebase
import Firebase from 'firebase';
var config = {
  apiKey: "AIzaSyCbNEewyeYO1L-UI4PpU3bAkyHmKoA30NY",
  authDomain: "wellbeing-checklist.firebaseapp.com",
  databaseURL: "https://wellbeing-checklist.firebaseio.com",
  storageBucket: "wellbeing-checklist.appspot.com",
};
// Initialize Firebase
Firebase.initializeApp(config);
var database = firebase.database();

// Material UI stuff
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Card, CardHeader} from 'material-ui/Card';
import AppBar from 'material-ui/AppBar';
// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

var App = React.createClass({
  render: function() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()} >
        <AppContent data={this.props.data} />
      </MuiThemeProvider>
    );
  }
});

var AppContent = React.createClass({
  render: function() {
    return (
      <div class="appContent">
        <AppBar title="Wellbeing Checklist" showMenuIconButton={false} />
        <QuestionList data={this.props.data} />
      </div>
    );
  }
});

var QuestionList = React.createClass({
  mixins: [ReactFireMixin],
  getInitialState() {
      return {
        questions: []
      };
  },
  componentWillMount() {
    database.ref('questions').on('value', function(snapshot) {
      var questions = [];
      snapshot.forEach(function(childSnapshot) {
        var question = childSnapshot.val();
        questions.push(question);
      }.bind(this));
      this.setState ({questions : questions});
    }.bind(this));
  },
  render: function() {
    var questionNodes = this.state.questions.map(function(question) {
      return (
        <Question key={question.id} id={question.id} selectedValue={question.selectedValue}>
          {question.text}
        </Question>
      )
    });
    return (
      <div class="questionList">
        {questionNodes}
      </div>
    );
  }
});

var Question = React.createClass({
  render: function() {
    return (
      <Card>
        <CardHeader title={this.props.children} />
        <QuestionButtons id={this.props.id} />
      </Card>
    );
  }
});

var QuestionButtons = React.createClass({
  getInitialState() {
    return {
      answer: ''
    };
  },
  componentWillMount() {
    this.databaseReference = database.ref('questions/' + this.props.id + '/answers/' + dateMarker);
    // console.log("this.databaseReference = " + this.databaseReference);
    this.databaseReference.orderByKey().limitToFirst(1).on('value', function(snapshot) {
      var answer = '';
      snapshot.forEach(function(childSnapshot) {
        var answer = childSnapshot.val();
        console.log("childSnapshot answer: " + answer);
      }.bind(this));
      this.setState ({answer : answer});
    }.bind(this));
    console.log(this.state.answer);
  },
  onChange(e) {
    var newRef = this.databaseReference.push(
      {
        "value" : e.target.value
      }
    );
  },
  render: function() {
    return (
      <form name="questionButtons" id={this.props.id}>
        <input type="radio" name={"question" + this.props.id} value="0" onChange={this.onChange} />No
        <input type="radio" name={"question" + this.props.id} value="0.5" onChange={this.onChange} />Slightly
        <input type="radio" name={"question" + this.props.id} value="1" onChange={this.onChange} />Yes
      </form>
    );
  }
});

ReactDOM.render(
  <App />,
  document.getElementById('react')
);
