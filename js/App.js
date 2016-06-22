import React from 'react';
import ReactDOM from 'react-dom';
import {ReactFire, ReactFireMixin} from 'reactfire';
import ReactMixin from 'react-mixin';
import Firebase from 'firebase';

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

// Configure Firebase
var config = {
  apiKey: "AIzaSyCbNEewyeYO1L-UI4PpU3bAkyHmKoA30NY",
  authDomain: "wellbeing-checklist.firebaseapp.com",
  databaseURL: "https://wellbeing-checklist.firebaseio.com",
  storageBucket: "wellbeing-checklist.appspot.com",
};

Firebase.initializeApp(config);
var database = firebase.database();

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
        <QuestionButtons id={this.props.id} selectedValue={this.props.selectedValue} />
      </Card>
    );
  }
});

var QuestionButtons = React.createClass({
  getInitialState() {
    return {
      answers: ''
    };
  },
  componentWillMount() {
    this.databaseRef = database.ref('answers');
  },
  onChange(e) {
    console.log(e.target.value);
    this.databaseRef.push(e.target.value);
  },
  render: function() {
    return (
      <form name="questionButtons" id={this.props.id}>
        <input type="radio" name={"questionButton" + this.props.id} value="0" onChange={this.onChange} />No
        <input type="radio" name={"questionButton" + this.props.id} value="0.5" onChange={this.onChange} />Slightly
        <input type="radio" name={"questionButton" + this.props.id} value="1" onChange={this.onChange} />Yes
      </form>
    );
  }
});

ReactDOM.render(
  <App />,
  document.getElementById('react')
);
