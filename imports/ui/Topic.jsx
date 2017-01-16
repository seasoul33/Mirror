import React, { Component, PropTypes } from 'react';
import { Badge, Button, Modal, Label, Panel } from 'react-bootstrap';
// import { Tooltip, Popover, OverlayTrigger } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import TagsInput from 'react-tagsinput'
import { Topics } from '../api/topics.js';

import Form from './Form.jsx';
 
// Topic component - represents a single topic item
export default class Topic extends Component {
    constructor() {
        super();
        this.state = {showModal:false};
    }

    openModal() {
        this.setState({showModal:true});
    }

    closeModal() {
        this.setState({showModal:false});
    }

    secondthistopic() {
  		if(this.props.username === 'admin') {
            this.props.selecttopic(this.props.topic);
            return;
        }

        if( (this.props.topic.sponsor === this.props.username) &&
            (this.props.topic.replied === 0) ) {
            Topics.remove(this.props.topic._id);
        }

        if(this.props.topic.sponsor !== this.props.username) {
            let newlist = this.props.topic.secondlist.slice();
            let index = this.props.topic.secondlist.indexOf(this.props.username);
            let newSeconded;

            if( index === -1) {
                newSeconded = this.props.topic.seconded + 1;
                newlist.push(this.props.username);
            }
            else {
                newSeconded = this.props.topic.seconded - 1;
                newlist.splice(index, 1);
            }
            
            Topics.update(this.props.topic._id, 
                            { $set: { seconded: newSeconded,
                                      secondlist: newlist
                                    } 
                            }
                         );
        }
    }

    comment() {
        if(this.props.username === 'admin') {
            return;
        }

        if(this.props.topic.replied === 0) {
            return ;
        }

        const acceptindex = this.props.topic.acceptlist.indexOf(this.props.username);
        const suckindex = this.props.topic.sucklist.indexOf(this.props.username);
        let newacceptlist = this.props.topic.acceptlist.slice();
        let newsucklist = this.props.topic.sucklist.slice();

        if(acceptindex !== -1) {
            newacceptlist.splice(acceptindex, 1);
            newsucklist.push(this.props.username);
            Topics.update(this.props.topic._id, 
                            { $set: { accept: this.props.topic.accept-1,
                                      acceptlist: newacceptlist,
                                      suck: this.props.topic.suck+1,
                                      sucklist: newsucklist,
                                    } 
                            }
                         );
        }
        else if(suckindex !== -1) {
            newsucklist.splice(suckindex, 1);
            Topics.update(this.props.topic._id, 
                            { $set: { suck: this.props.topic.suck-1,
                                      sucklist: newsucklist,
                                    } 
                            }
                         );
        }
        else {
            newacceptlist.push(this.props.username);
            Topics.update(this.props.topic._id, 
                            { $set: { accept: this.props.topic.accept+1,
                                      acceptlist: newacceptlist
                                    } 
                            }
                         );
        }

        return;
    }

    handleTagChange(tags) {
        Topics.update(this.props.topic._id, { $set: { tags: tags} });
    }
    
    renderDetail() {
        const opentimestring = moment(Date.parse(this.props.topic.raisedAt)).format('lll');
        const replytimestring = moment(Date.parse(this.props.topic.repliedTime)).format('lll');
        let replyPanel;
        // dangerous usage...
        const descPanel = (<Panel header="Description"><div dangerouslySetInnerHTML={{__html:this.props.topic.description.replace(/\n/g, '<br/>')}} /></Panel>);
        
        // const tooltip = (<Tooltip id={'tip'+this.props.topic._id}>{this.props.topic.description} - {opentimestring}</Tooltip>);
        // const popover = (<Popover id={'pop'+this.props.topic._id} title={'回應 ('+replytimestring+')'}>{this.props.topic.anwser}</Popover>);
        // if(this.props.topic.replied === 0) {
        //     return (<div className="detail">
        //                 <OverlayTrigger overlay={tooltip} placement="top">
        //                     <strong>{this.props.topic.title}</strong>
        //                 </OverlayTrigger>
        //             </div>);
        // }
        // else {
        //     return (<div className="detail">
        //                 <OverlayTrigger overlay={popover} placement="bottom">
        //                     <OverlayTrigger overlay={tooltip} placement="top">
        //                         <strong>{this.props.topic.title}</strong>
        //                     </OverlayTrigger>
        //                 </OverlayTrigger>
        //             </div>);
        // }

        if(this.props.topic.replied === 1) {
            // dangerous usage...
            replyPanel = (<Panel header={"Reply (replied at "+replytimestring+")"}><div dangerouslySetInnerHTML={{__html:this.props.topic.anwser.replace(/\n/g, '<br/>')}} /></Panel>);
        }
        else {
            replyPanel = '';
        }
        return (<div className="detail">
                    <Button className="forminvokeButton" bsStyle="warning" bsSize="xsmall" title="Click to see detail..."
                            onClick={this.openModal.bind(this)}>
                        {this.props.topic.title}
                    </Button>
                    <Modal show={this.state.showModal} onHide={this.closeModal.bind(this)}>
                        <Modal.Body>
                            <Button className="closeModal" bsSize="xsmall" onClick={this.closeModal.bind(this)}>Close</Button>
                            <Panel header={"Title (created at "+opentimestring+")"}>{this.props.topic.title}</Panel>
                            {descPanel}
                            {replyPanel}
                            {this.renderInfor()}
                        </Modal.Body>
                    </Modal>
                </div>);
    }

    renderStatistic() {
        return (
                <span className="statistic">
                    <span> <Badge>附議 {this.props.topic.seconded}</Badge></span>
                    <span> | <Badge style={this.renderLightBulb('MediumSeaGreen')}>接受 {this.props.topic.accept}</Badge></span>
                    <span> <Badge style={this.renderLightBulb('#C9605C')}>打槍 {this.props.topic.suck}</Badge></span>
                </span>
               );
    }

    renderLightBulb(color) {
        if(this.props.topic.replied === 0) {
            return ({background: "silver", opacity:0.3});
        }

        return ({background: color});
    }

    renderStatusButton() {
        if(this.props.topic.replied === 1) {
            if(this.props.username === 'admin') {
                return (<Button bsSize="xsmall" title="已經回覆" disabled>Done</Button>);
            }
        }

        if(this.props.topic.replied === 0) {
            return (<Button bsSize="xsmall" title="等待回覆中..." disabled>等待回覆</Button>);
        }

        const acceptindex = this.props.topic.acceptlist.indexOf(this.props.username);
        const suckindex = this.props.topic.sucklist.indexOf(this.props.username);
        if(acceptindex !== -1) {
            return (<Button bsSize="xsmall" bsStyle="success" title="目前為「接受」，點擊後切換為「打槍」" onClick={this.comment.bind(this)}>接受</Button>);
        }
        else if(suckindex !== -1) {
            return (<Button bsSize="xsmall" bsStyle="danger" title="目前為「打槍」，點擊後切換為「考慮」" onClick={this.comment.bind(this)}>打槍</Button>);
        }

        return (<Button bsSize="xsmall" title="目前為「考慮」，點擊後切換為「接受」" onClick={this.comment.bind(this)}>考慮</Button>);
    }

    renderAction() {
        if(this.props.username === 'admin') {
            return (<button className="noborderbutton" title="回覆" onClick={this.secondthistopic.bind(this)}>
                        <img className="imggood" src={'/reply.png'} />
                    </button>);
        }

        if(this.props.topic.sponsor === this.props.username) {
            if(this.props.topic.replied === 1) {
                return (<button className="noborderbutton" title="已有回應、無法刪除">
                            <img className="imggood" src={'/nodelete.png'} />
                        </button>);
            }
            return (<button className="noborderbutton" title="刪除" onClick={this.secondthistopic.bind(this)}>
                        <img className="imggood" src={'/delete.png'} />
                    </button>);
        }

        if(this.props.topic.secondlist.indexOf(this.props.username) !== -1) {
            return (<button className="noborderbutton" title="取消附議" onClick={this.secondthistopic.bind(this)}>
                        <img className="imggood" src={'/second.png'} />
                    </button>);
        }

        return (<button className="noborderbutton" title="附議" onClick={this.secondthistopic.bind(this)}>
                    <img className="imggood_opacity" src={'/second.png'} />
                </button>);
    }

    renderTags () {
        if(this.props.topic.sponsor === this.props.username) {
            return (<TagsInput value={this.props.topic.tags} 
                        onChange={this.handleTagChange.bind(this)} 
                        removeKeys={[]}
                    />);
        }
        else {
            return (<TagsInput value={this.props.topic.tags} 
                        onChange={this.handleTagChange.bind(this)} 
                        inputProps={{className: 'react-tagsinput-input', placeholder:''}} 
                        disabled
                    />);
        }
    }

    renderInfor () {
        return (<div>
                    {this.renderStatistic()}
                    {this.renderTags()}
                    
                    <span className="buttongroup">
                        {this.renderStatusButton()}
                        {this.renderAction()}
                    </span>
                </div>);
    }

    render() {
        return (
            <li>
                {this.renderDetail()}
                {this.renderInfor()}
      		</li>
    	);
  	}
}
 
Topic.propTypes = {
  	// This component gets the topic to display through a React prop.
  	// We can use propTypes to indicate it is required
  	topic: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired,
    selecttopic: PropTypes.func.isRequired,
};