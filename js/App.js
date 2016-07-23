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
import {green700, orange500, red500, white, grey400, grey100}
  from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import AddIcon from 'material-ui/svg-icons/content/add';
import Snackbar from 'material-ui/Snackbar';
import {List, ListItem} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import CheckboxIcon from 'material-ui/svg-icons/toggle/check-box';
// Needed for onTouchTap
injectTapEventPlugin();

const theme = getMuiTheme({
  fontFamily: 'system, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  palette: {
    primary1Color: green700,
    canvasColor: white
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
  addAction() {
    database.ref('actions/').push({"text": ""});
  },
  render: function() {
    return (
      <div class="appContent" style={{"backgroundColor": grey100}}>
        <AppBar
          title={"Well – " + new Date()} showMenuIconButton={false}
        />
        <div className="clearfix">
          <div className="col lg-col-6 md-col-6 col-12 px2">
              <p className="h3">How are you today?</p>
              <RaisedButton
                label="Add question"
                icon={<AddIcon />}
                onTouchTap={this.addQuestion}
                className="mb2"
              />
            <QuestionList />
          </div>
          <div className="col lg-col-6 md-col-6 col-12 px2">
            <p className="h3">Today I did something to...</p>
            <RaisedButton
                label="Add action"
                icon={<AddIcon />}
                onTouchTap={this.addAction}
                className="mb2"
              />
            <ActionList />
          </div>
        </div>
        <Snackbar
          open={this.state.open}
          message="Question deleted"
          autoHideDuration={4000}
        />
                <Paper className="p2 lg-m2">
      </div>
    );
  }
});

var QuestionList = React.createClass({
  mixins: [ReactFireMixin],
  getInitialState() {
      return {
        questions: [],
        displayProgress: ""
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
    this.setState({displayProgress: "inline"})
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
        <CircularProgress style={{"display": this.state.displayProgress}} />
        {questionNodes}
      </div>
    );
  },
  componentDidMount() {
      this.setState({displayProgress: "none"});
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
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      database.ref('questions/' + this.props.id).set({"text": e.target.value});
      document.activeElement.blur();
    }
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
            onKeyDown={this.questionTextChange}
          />
        </CardText>
        <CardText>
          <QuestionButtons id={this.props.id} />
        </CardText>
        <CardActions>
          <FlatButton
            icon={<DeleteIcon />}
            label="Delete"
            style={{color: grey400}}
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
    database.ref('actions').orderByChild('last-answer-time').on('value', function(snapshot) {
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
        <Action
          id={actionKey}
          key={actionKey}
          className="pb2"
        >
          {action.text}
        </Action>
      )
    });
    return (
      <List>
        {actionNodes}
      </List>
    );
  },
  componentWillUpdate() {
    this.scrolled = document.body.scrollTop;
  },
  componentDidUpdate() {
      window.scrollTo(0, this.scrolled);
  },
});

var Action = React.createClass({
  getInitialState() {
      return {
          check: false,
          open: false
      };
  },
  componentWillMount() {
    this.databaseReference = database.ref('actions/' + this.props.id + '/answers/' + dateMarker + '/');
    this.databaseReference.on('value', function(snapshot) {
      var check = false;
      snapshot.forEach(function(childSnapshot) {
        check = childSnapshot.val();
      }.bind(this));
      this.setState ({check : check});
    }.bind(this));
  },
  handleCheck(e) {
    this.databaseReference.set({"value": e.target.checked});
    if (e.target.checked) {
      database.ref('actions/' + this.props.id).update({
        "last-answer-time": new Date()
      });
      console.log("date logged");
    }
  },
  deleteAction() {
    database.ref('actions/' + this.props.id).remove();
    database.ref('actions/' + this.props.id).once('child_removed')
      .then(function(dataSnapshot) {
        this.setState({open: true});
      }.bind(this));
  },
  render: function() {
    const actionListCheckbox = (
      <Checkbox
        onCheck={this.handleCheck}
        checked={this.state.check}
        // uncheckedIcon={<CheckboxIcon />}
        iconStyle={this.state.check == false ? {fill: grey400} : {fill: green700}}
      />
    );
    const iconButtonElement = (
      <IconButton
        touch={true}
        tooltip="More"
        tooltipPosition="top-left"
      >
        <MoreVertIcon />
      </IconButton>
    );

    const rightIconMenu = (
      <IconMenu
        iconButtonElement={iconButtonElement}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        iconStyle={{fill: grey400}}
      >
        <MenuItem primaryText="Edit" />
        <MenuItem
          primaryText="Delete"
          onClick={this.deleteAction}
        />
      </IconMenu>
    );
    return (
      <ListItem
        leftCheckbox={actionListCheckbox}
        primaryText={this.props.children}
        rightIconButton={rightIconMenu}
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
            label="Yes"
            style={radioStyles.radioButton}
            labelStyle={this.state.answer == 0 ? radioStyles.radioButtonNo : null}
            iconStyle={this.state.answer == 0 ? radioStyles.radioButtonNo : null}
          />
          <RadioButton
            value="0.5"
            label="Mostly"
            style={radioStyles.radioButton}
            labelStyle={this.state.answer == 0.5 ? radioStyles.radioButtonSlightly : null}
            iconStyle={this.state.answer == 0.5 ? radioStyles.radioButtonSlightly : null}
          />
          <RadioButton
            value="1"
            label="No"
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
