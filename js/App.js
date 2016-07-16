// Import React
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


// Setup Firebase

//// Import Firebase
import Firebase from 'firebase';

//// Configure Firebase
var config = {
  apiKey: "AIzaSyCbNEewyeYO1L-UI4PpU3bAkyHmKoA30NY",
  authDomain: "wellbeing-checklist.firebaseapp.com",
  databaseURL: "https://wellbeing-checklist.firebaseio.com",
  storageBucket: "wellbeing-checklist.appspot.com",
};

//// Initialize Firebase
Firebase.initializeApp(config);
var database = firebase.database();

// Import Material components
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Card, CardText, CardActions} from 'material-ui/Card';
import {green700, orange500, red500, white} from 'material-ui/styles/colors'
import AppBar from 'material-ui/AppBar';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import AddIcon from 'material-ui/svg-icons/content/add';
import Snackbar from 'material-ui/Snackbar';
// Needed for onTouchTap
injectTapEventPlugin();

const theme = getMuiTheme({
  fontFamily: 'system, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  palette: {
    primary1Color: green700,
  },
  appBar: {
    textColor: white,
  },
});

var App = React.createClass({
  render: function() {
    return (
      <MuiThemeProvider muiTheme={theme} >
        <AppContent />
      </MuiThemeProvider>
    );
  }
});

var AppContent = React.createClass({
  getInitialState() {
      return {
        open: false
      };
  },
  addQuestion() {
    database.ref('questions/').push({"text": ""});
  },
  render: function() {
    return (
      <div class="appContent">
        <AppBar
          title={"Well – " + new Date()} showMenuIconButton={false}
        />
        <div className="clearfix">
          <div className="col lg-col-6 md-col-6 px2">
            <div className="clearfix">
              <p className="h3 left">How are you today?</p>
              <div className="right">
                <FlatButton
                  label="Add question"
                  icon={<AddIcon />}
                  onTouchTap={this.addQuestion}
                />
              </div>
            </div>
            <QuestionList />
          </div>
          <div className="col lg-col-6 md-col-6 px2">
            <p className="h3">Wellbeing Checklist</p>
            <ActionList />
          </div>
        </div>
        <Snackbar
          open={this.state.open}
          message="Question deleted"
          autoHideDuration={4000}
        />
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
    database.ref('questions').orderByChild('last-answer-time').on('value', function(snapshot) {
      var questions = [];
      snapshot.forEach(function(childSnapshot) {
        var question = childSnapshot;
        questions.push(question);
      }.bind(this));
      this.setState ({questions : questions});
    }.bind(this));
  },
  render: function() {
    var questionNodes = this.state.questions.map(function(question) {
      var questionKey = question.key;
      question = question.val();
      return (
        <div className="pb2" key={questionKey}>
          <Question id={questionKey} questionText={question.text}></Question>
        </div>
      )
    });
    return (
      <div class="questionList">
        {questionNodes}
      </div>
    );
  },
  componentWillUpdate() {
    this.scrolled = document.body.scrollTop;
  },
  componentDidUpdate() {
      window.scrollTo(0, this.scrolled);
  },
});

var Question = React.createClass({
  questionTextChange(e) {
    database.ref('questions/' + this.props.id).set({"text": e.target.value});
  },
  deleteQuestion() {
    database.ref('questions/' + this.props.id).remove();
    database.ref('questions/' + this.props.id).once('child_removed')
      .then(function(dataSnapshot) {
        this.setState({open: true});
      }.bind(this));
  },
  render: function() {
    return (
      <Card>
        <CardText>
          <TextField
            defaultValue={this.props.questionText}
            fullWidth={true}
            multiLine={true}
            id={this.props.id}
            onKeyUp={this.questionTextChange}
          />
        </CardText>
        <CardText>
          <QuestionButtons id={this.props.id} />
        </CardText>
        <CardActions>
          <FlatButton
            icon={<DeleteIcon />}
            label="Delete"
            rippleColor={red500}
            hoverColor={red500}
            onTouchTap={this.deleteQuestion}
          />
        </CardActions>
      </Card>
    );
  }
});

var ActionList = React.createClass({
  mixins: [ReactFireMixin],
  getInitialState() {
      return {
        actions: []
      };
  },
  componentWillMount() {
    database.ref('actions').on('value', function(snapshot) {
      var actions = [];
      snapshot.forEach(function(childSnapshot) {
        var action = childSnapshot;
        actions.push(action);
      }.bind(this));
      this.setState ({actions : actions});
    }.bind(this));
  },
  render: function() {
    var actionNodes = this.state.actions.map(function(action) {
      var actionKey = action.key;
      action = action.val();
      return (
        <div className="pb2" key={actionKey}>
          <Action id={actionKey}>
            {action.text}
          </Action>
        </div>
      )
    });
    return (
      <div class="actionList">
        {actionNodes}
      </div>
    );
  }
});

var Action = React.createClass({
  getInitialState() {
      return {
          switched: false
      };
  },
  componentWillMount() {
    this.databaseReference = database.ref('actions/' + this.props.id + '/answers/' + dateMarker + '/');
    this.databaseReference.limitToLast(1).on('value', function(snapshot) {
      var switched = '';
      snapshot.forEach(function(childSnapshot) {
        switched = childSnapshot.val();
      }.bind(this));
      this.setState ({switched : switched});
    }.bind(this));
  },
  // onCheck() {
  //   this.setState({switched : !this.state.switched});
  //   console.log(!this.state.switched);
  //   this.databaseReference.set({"value" : this.state.switched});
  // },
  render: function() {
    return (
      <Checkbox
        label={this.props.children}
        checked
        // onCheck={this.onCheck}
      />
    );
  }
});

const radioStyles = {
  radioButton: {
    marginBottom: 16,
  },
  radioButtonNo: {
    color: green700,
    fill: green700,
  },
  radioButtonSlightly: {
    color: orange500,
    fill: orange500
  },
  radioButtonYes: {
    color: red500,
    fill: red500
  },
};

var QuestionButtons = React.createClass({
  getInitialState() {
    return {
      answer: ""
    };
  },
  componentWillMount() {
    this.databaseReference = database.ref('questions/' + this.props.id + '/answers/' + dateMarker + '/');
    this.databaseReference.limitToLast(1).on('value', function(snapshot) {
      var answer = '';
      snapshot.forEach(function(childSnapshot) {
        answer = childSnapshot.val();
      }.bind(this));
      this.setState ({answer : answer.value});
    }.bind(this));
  },
  onChange(e) {
    this.setState({
      answer: e.target.value
    });
    this.databaseReference.push({
      "value": e.target.value
    });
    database.ref('questions/' + this.props.id).update({
      "last-answer-time": new Date()
    });
  },
  render: function() {
    return (
      <CardActions>
        <RadioButtonGroup
          name="questionButtons"
          defaultSelected={this.state.answer}
          onChange={this.onChange}
        >
          <RadioButton
            value="0"
            label="No"
            style={radioStyles.radioButton}
            labelStyle={this.state.answer == 0 ? radioStyles.radioButtonNo : null}
            iconStyle={this.state.answer == 0 ? radioStyles.radioButtonNo : null}
          />
          <RadioButton
            value="0.5"
            label="Slightly"
            style={radioStyles.radioButton}
            labelStyle={this.state.answer == 0.5 ? radioStyles.radioButtonSlightly : null}
            iconStyle={this.state.answer == 0.5 ? radioStyles.radioButtonSlightly : null}
          />
          <RadioButton
            value="1"
            label="Yes"
            style={radioStyles.radioButton}
            labelStyle={this.state.answer == 1 ? radioStyles.radioButtonYes : null}
            iconStyle={this.state.answer == 1 ? radioStyles.radioButtonYes : null}
          />
        </RadioButtonGroup>
      </CardActions>
    );
  }
});



ReactDOM.render(
  <App />,
  document.getElementById('react')
);
