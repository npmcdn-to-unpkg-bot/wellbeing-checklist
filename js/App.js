// Import React
import React from 'react';
import ReactDOM from 'react-dom';
import { ReactFire, ReactFireMixin } from 'reactfire';
import ReactMixin from 'react-mixin';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

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
import Dialog from 'material-ui/Dialog';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import {green700, orange500, red500, white, black, grey400, grey100}
  from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
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
import {Tabs, Tab} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
// Needed for onTouchTap
injectTapEventPlugin();

const snackbarReducer = (state = [], action) => {
  switch (action.type) {
    case 'OPEN_SNACKBAR':
      return state.concat([ action.text ])
    default:
      return state
  }
};

const store = createStore(snackbarReducer, {});


const theme = getMuiTheme({
  fontFamily: 'system, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  palette: {
    primary1Color: green700,
    accent1Color: black,
    canvasColor: white
  },
  appBar: {
    textColor: white,
  },
});

var App = React.createClass({
  render: function() {
    return (
      <MuiThemeProvider muiTheme={theme}>
        <AppContent ref="appContent" />
      </MuiThemeProvider>
    );
  }
});

var AppContent = React.createClass({
  getInitialState() {
      return {
          snackbarOpen: false,
          snackbarMessage: ""
      };
  },
  addQuestion() {
    database.ref('questions/').push({"text": ""});
  },
  render: function() {
    return (
      <div class="appContent">
        <AppBar
          title={"Well – " + dateMarker}
          showMenuIconButton={false}
        / >
        <Tabs contentContainerClassName="max-width-4 mx-auto">
          <Tab label="Activity">
            <div className="max-width-4 mx-auto">
              <div className="clearfix">
                <AddActionDialog />
                <Labels />
              </div>
            </div>
          </Tab>
          <Tab label="Perception">
            <div className="col lg-col-6 md-col-6 col-12 px2">
                <div className="clearfix">
                  <div className="flex items-baseline">
                    <p className="h3 left">How have you been feeling?</p>
                    <RaisedButton
                      label="Add question"
                      icon={<AddIcon />}
                      onTouchTap={this.addQuestion}
                      className="mb2 right"
                    />
                  </div>
                </div>
              <QuestionList />
            </div>
          </Tab>
        </Tabs>
        <Snackbar
          message={this.state.snackbarMessage}
          open={this.state.snackbarOpen}
          autoHideDuration={3000}
        />
      </div>
    );
  }
});

const AddActionDialog = React.createClass({
  getInitialState() {
      return {
        open: false
      };
  },
  toggleDialog() {
    this.setState({
      open: !this.state.open
    })
  },
  addAction() {
    database.ref('actions/').push({"text": ""});
  },
  render: function() {
    return (
      <div className="addAction">
        <div className="clearfix">
          <RaisedButton
            label="Add action"
            icon={<AddIcon />}
            onTouchTap={this.toggleDialog}
            className="right my2"
          />
        </div>
        <Dialog
          title="Add action"
          modal={false}
          open={this.state.open}
          onRequestClose={this.toggleDialog}
        >
          <AddActionForm />
        </Dialog>
      </div>
    );
  }
});


const AddActionForm = React.createClass({
  getInitialState() {
      return {
        name: "",
        perceptualImpact: "",
        labelKey: ""
      };
  },
  selectLabel(e, i, payload) {
    this.setState({
      labelKey: payload
    });
  },
  updateName(e) {
    this.setState({
      name: e.target.value
    });
  },
  updatePerceptualImpact(e) {
    this.setState({
      perceptualImpact: e.target.value
    });
  },
  addAction() {
    database.ref('actions').push({
      text: this.state.name,
      perceptualImpact: this.state.perceptualImpact,
      labelKey: this.state.labelKey
    });

    this.setState(this.getInitialState());
  },
  render: function() {
    var labels = [];
    database.ref('labels').orderByChild('perception').on('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot){
        labels.push(childSnapshot);
      });
    });
    var labelNodes = labels.map(function(rawLabel) {
      const labelKey = rawLabel.key;
      const label = rawLabel.val();
      return (
        <MenuItem
          primaryText={label.label}
          key={labelKey}
          value={labelKey}
        />
      );
    });
    return(
      <div className="addActionForm">
        <TextField
          floatingLabelText={"Action name"}
          fullWidth={true}
          value={this.state.name}
          onChange={this.updateName}
        />
        <br />
        <TextField
          floatingLabelText={"Perceptual impact"}
          type={"number"}
          helpText={"0.25"}
          min="0"
          max="1"
          step="0.05"
          value={this.state.perceptualImpact}
          onChange={this.updatePerceptualImpact}
        />
        <br />
        <SelectField
          value={this.state.labelKey}
          onChange={this.selectLabel}
          autoWidth={true}
          fullWidth={true}
          floatingLabelText="Select label"
        >
          {labelNodes}
        </SelectField>
        <br />
        <RaisedButton
          label={"Add"}
          primary={true}
          onTouchTap={this.addAction}
        />
      </div>
    );
  }
});

var Labels = React.createClass({
  mixins: [ReactFireMixin],
  getInitialState() {
      return {
        labels: []
      };
  },
  componentWillMount() {
    database.ref('labels').orderByChild('perception').on('value', function(snapshot) {
      var labels = [];
      snapshot.forEach(function(childSnapshot) {
        var label = childSnapshot;
        labels.push(label);
      }.bind(this));
      this.setState ({labels : labels});
    }.bind(this));
  },
  render: function() {
    var labelNodes = this.state.labels.map(function(label) {
      var labelKey = label.key;
      var label = label.val();
      return (
        <Label
          id={labelKey}
          key={labelKey}
          name={label.label}
          perception={label.perception}
        />
      )
    });
    if (this.state.labels.length != 0) {
      return (
        <div>{labelNodes}</div>
      );
    } else {
      return (
        <p className="center">All labels done</p>
      );
    };
  },
  componentWillUpdate() {
    this.scrolled = document.body.scrollTop;
  },
  componentDidUpdate() {
      window.scrollTo(0, this.scrolled);
  },
});

const Label = React.createClass({
  changePerceptionColor() {
    if (this.props.perception <= 0.25) {
      return { color: red500 }
    } else if (this.props.perception > 0.25 && this.props.perception <= 0.75) {
      return { color: orange500 }
    } else {
      return { color: green700 }
    }
  },
  render: function() {
    return (
      <div className="actionCategoryGroup">
        <div className="mb1">
          {this.props.name + " – "}
          <span
            style={this.changePerceptionColor()}
          >
            {this.props.perception}
          </span>
        </div>
        <Card className="mb3">
          <ActionList
            id={this.props.id}
            perception={this.props.perception}
          />
        </Card>
      </div>
    );
  }
});

const ActionList = React.createClass({
  getInitialState() {
      return {
          actions: []
      };
  },
  componentWillMount() {
    var ref = database.ref('actions').orderByChild('labelKey').equalTo(this.props.id);
    ref.on('value', function(snapshot) {
      var actions = [];
      snapshot.forEach(function(childSnapshot) {
        var action = childSnapshot;
        actions.push(action);
      }.bind(this));
      this.setState({actions: actions});
    }.bind(this));
  },
  render: function() {
    var actionNodes = this.state.actions.map(function(action) {
      var actionKey = action.key;
      var action = action.val();
      return (
        <Action
          key={actionKey}
          id={actionKey}
          labelKey={this.props.id}
          perceptualImpact={action.perceptualImpact}
          perception={this.props.perception}
        >
          {action.text}
        </Action>
      );
    }.bind(this));
    return (
      <div>{actionNodes}</div>
    )
  }
});

var Action = React.createClass({
  getInitialState() {
      return {
          check: false
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
    this.databaseReference.set({
      "value": e.target.checked
    });
    if (e.target.checked) {
      database.ref('actions/' + this.props.id).update({
        "last-answer-time": new Date()
      });

      var perceptionCalculationResult = this.props.perception + this.props.perceptualImpact;
      var perception;
      if (perceptionCalculationResult >= 1) {
        perception = 1;
      } else {
        perception = perceptionCalculationResult;
      };

      database.ref('labels/' + this.props.labelKey).update({
        "perception": perception
      });
    } else {
      var perceptionCalculationResult = this.props.perception - this.props.perceptualImpact;
      var perception;
      if (perceptionCalculationResult <= 0) {
        perception = 0;
      } else {
        perception = perceptionCalculationResult;
      };

      database.ref('labels/' + this.props.labelKey).update({
        "perception": perception
      });
    };
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
      <div className="listItem">
        <ListItem
          leftCheckbox={actionListCheckbox}
          primaryText={this.props.children}
          secondaryText={"Impact on perception " + this.props.perceptualImpact}
          rightIconButton={rightIconMenu}
        />
        <Divider inset={true} />
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
        var daysTillRepeat = "";
        database.ref('questions/' + question.key + '/days-till-repeat').on('value', function(childSnapshot){
          daysTillRepeat = childSnapshot.val();
        });
        var lastAnswerDay = "";
        database.ref('questions/' + question.key + '/last-answer-time/').on('value', function(childSnapshot){
          if (childSnapshot.val() != null) {
            var lastAnswerTime = new Date(childSnapshot.val());
            var first = new Date(lastAnswerTime.getFullYear(), 0, 1);
            var theDay = lastAnswerTime.getDay();
            var theYear = lastAnswerTime.getFullYear();
            lastAnswerDay = Math.round(((lastAnswerTime - first) / 1000 / 60 / 60 / 24) + .5, 0);
          };
        });
        if ((theDay - lastAnswerDay) > daysTillRepeat) {
          questions.push(question);
        };
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
        <Question
          id={questionKey}
          key={questionKey}
          questionText={question.text}
          labelKey={question.labelKey}
        >
        </Question>
      )
    });
    if (this.state.questions.length != 0) {
      return (
        <div className="questionsList">
          {questionNodes}
        </div>
      );
    } else {
      return (
        <p>All questions answered</p>
      );
    };
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
    store.dispatch({
      type: 'OPEN_SNACKBAR',
      snackbarOpen: open,
      snackbarMessage: "Question deleted"
    });
  },
  render: function() {
    return (
      <Card
        className="mb2"
      >
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
          <QuestionButtons
            id={this.props.id}
            labelKey={this.props.labelKey}
          />
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
    database.ref('labels/' + this.props.labelKey).update({
      "perception": e.target.value
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
            value="1"
            label="Yes"
            style={radioStyles.radioButton}
            labelStyle={this.state.answer == 0 ? radioStyles.radioButtonNo : null}
            iconStyle={this.state.answer == 0 ? radioStyles.radioButtonNo : null}
          />
          <RadioButton
            value="0.5"
            label="Middle"
            style={radioStyles.radioButton}
            labelStyle={this.state.answer == 0.5 ? radioStyles.radioButtonSlightly : null}
            iconStyle={this.state.answer == 0.5 ? radioStyles.radioButtonSlightly : null}
          />
          <RadioButton
            value="0"
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
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('react')
);