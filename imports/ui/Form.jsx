import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import { Meteor } from 'meteor/meteor';
import { Topics } from '../api/topics.js';
 
// Topic component - represents a single topic item
export default class Form extends Component {
    handleSubmit(event) {
        event.preventDefault();

        if(Meteor.user()) {
            if(this.props.username === 'admin') {
                const reply = ReactDOM.findDOMNode(this.refs.replyInput).value.trim();
                if(reply.length === 0) {
                    return;
                }

                Topics.update(this.props.topic._id, 
                                { $set: { replied: 1,
                                          anwser: reply
                                        } 
                                }
                             );
                ReactDOM.findDOMNode(this.refs.replyInput).value = '';
            }
            else {
                // Find the text field via the React ref
                const title = ReactDOM.findDOMNode(this.refs.titleInput).value.trim();
                if(title.length === 0) {
                    ReactDOM.findDOMNode(this.refs.descInput).value = '';
                    return;
                }
                const description = ReactDOM.findDOMNode(this.refs.descInput).value.trim();
                const sponsor = Meteor.user().username;
                const tags = ReactDOM.findDOMNode(this.refs.tagInput).value.trim().split(' ');
                console.log(tags);

                Topics.insert({
                    title,
                    description,
                    tags,
                    raisedAt: new Date(), // current time
                    sponsor,
                    seconded: 1,
                    secondlist: [sponsor],
                    replied: 0,
                    anwser: '',
                    accept: 0,
                    acceptlist: [],
                    suck: 0,
                    sucklist: []
                });

                // Clear form
                ReactDOM.findDOMNode(this.refs.titleInput).value = '';
                ReactDOM.findDOMNode(this.refs.descInput).value = '';
                ReactDOM.findDOMNode(this.refs.tagInput).value = '';
            }
        }
    }

  	render() {
    	if(this.props.username === 'admin') {
            return (
                <div>
                    <label className="label-form">回應</label>
                    <form className="new-topic">
                        <label>標題:{this.props.topic.title}</label><br/><br/>
                        <label>描述:{this.props.topic.description}</label><br/><br/>
                        回答:<br/>
                        <textarea
                            type="text"
                            ref="replyInput"
                            placeholder="Type to give reply"
                        /><br/>
                        <button className="new-button" type="button" onClick={this.handleSubmit.bind(this)}>送出回應</button>
                    </form>
                </div>
            );
        }
        else {
            return (
                <div>
                    <label className="form-label">想舉手發問?</label>
                    <form className="new-topic">
                        標題:<br/>
                        <input
                            type="text"
                            ref="titleInput"
                            placeholder="Type to add a new topic"
                            required
                        /><br/>
                        標籤:<br/>
                        <input
                            type="text"
                            ref="tagInput"
                            placeholder="Type to add tags"
                        /><br/>
                        描述:<br/>
                        <textarea
                            type="text"
                            ref="descInput"
                            placeholder="Type to give description"
                        /><br/>
                        <button className="new-button" type="button" onClick={this.handleSubmit.bind(this)}>舉手發問</button>
                    </form>
                </div>
            );
        }
    }
}
 
Form.propTypes = {
    // This component gets the topic to display through a React prop.
    // We can use propTypes to indicate it is required
  	topic: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired,
};