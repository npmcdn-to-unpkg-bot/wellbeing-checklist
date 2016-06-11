import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router';
import { DefaultRoute, Link, Route, RouteHandler } from 'react-router';
import ReactFire from 'reactfire';
import Firebase from 'firebase';



// Material UI stuff
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Card, CardHeader, CardActions} from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

var questions = [
  { id: 1, text: "Do you feel like you're maintaining enough liduidity in your assets?" },
  { id: 2, text: "Do you feel like you are living outside of your means?" },
  { id: 3, text: "Did you feel like you weren't making any progress towards long-term capital growth?" },
  { id: 4, text: "Do you feel like you aren't really improving your authority signalling?" },
  { id: 5, text: "Today did you feel like you were making no meaningful progress towards improving your ability to sort through the information you receive on a daily basis?" },
  { id: 6, text: "Did you sense of lacking control of your internal life?" },
  { id: 7, text: "Did you feel like you're not making progress with any skills?" },
  { id: 8, text: "Do you feel bored?" },
  { id: 9, text: "Did you feel significantly uncomfortable in your interactions with other people today?" },
  { id: 10, text: "Do you feel like you aren't sharing your pie?" },
  { id: 11, text: "Did you feel significant friction in managing your life?" },
  { id: 12, text: "Do you feel significant friction in managing your money?" },
  { id: 13, text: "Do you feel like you're consuming stuff that is unnaturally messing with your body's physiology?" },
  { id: 14, text: "Did you feel negative physical discomfort today?" },
  { id: 15, text: "Did you feel like you weren't making any progress towards improving your quantification of wellbeing?" },
  { id: 16, text: "Did you generally feel like things weren't going so well today?" },
  { id: 17, text: "Did you feel sleep-deprived today?" }
];

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <AppContent />
  </MuiThemeProvider>
);

const AppContent = () => (
  <div class="appContent">
    <AppBar title="Wellbeing Checklist" showMenuIconButton={false} />
    <QuestionList />
  </div>
);

var QuestionList = React.createClass({
  componentWillMount: function() {
    this.firebaseRef = new Firebase("https://wellbeing-checklist.firebaseio.com/items/");
    this.firebaseRef.on("child_added", function(dataSnapshot) {
      this.items.push(dataSnapshot.val());
      this.setState({
        items: this.items
      });
    }.bind(this));
  },
  render: function() {
    var questionNodes = this.props.data.map(function(question) {
      return (
        <Question key={question.id}>
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
        <QuestionButtons />
      </Card>
    );
  }
});
var QuestionButtons = React.createClass({
  render: function() {
    return (
      <CardActions>
        <FlatButton label="No"></FlatButton>
        <FlatButton label="A bit"></FlatButton>
        <FlatButton label="Yes"></FlatButton>
      </CardActions>
    );
  }
});
ReactDOM.render(
  <App />,
  document.getElementById('react')
);