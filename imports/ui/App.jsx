import React, { Component, PropTypes } from 'react';
// import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
 
import { Topics } from '../api/topics.js';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
 
import Topic from './Topic.jsx';
import Form from './Form.jsx';
 
// App component - represents the whole app
class App extends Component {
    renderTopics() {
        if(this.props.currentUser) {
            return this.props.topics.map((topic) => (
                <Topic key={topic._id} topic={topic} username={this.props.currentUser.username} />
            ));
        }
        else {
            return '';
        }
    }

    renderForm() {
        if(this.props.currentUser) {
            if(this.props.currentUser.username === 'admin') {
                return '';
            }
            return (<Form topic={{}} username={this.props.currentUser.username} />);
        }
        else {
            return '';
        }
    }
 
    render() {
        return (
            <div className="container">
                <header>
                    <h1>Wanted Board</h1>
                    <AccountsUIWrapper />
                </header>
 
                <ol>
                    {this.renderTopics()}
                </ol>

                <br/><br/><br/>
                <div id="inputarea">
                    {this.renderForm()}
                </div>
            </div>
        );
    }
}

App.propTypes = {
    topics: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
};
 
export default createContainer(() => {
    return {
        topics: Topics.find({}, { sort: { seconded: -1 } }).fetch(),
        currentUser: Meteor.user(),
    };
}, App);