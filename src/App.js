import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Portal from './Portal.js';

class Encoder extends React.Component {
    constructor (props) {
        super(props)
        this.state = { children: [] };
        console.log("PROPS=",props);
    }
    componentWillMount () {
        if(!this.notify && this.props.concept) {
            this.notify =
                this.props.portal.notify(this.props.concept, x => { this.onConcept(x) });
        }
    }
    componentDidMount () {
        console.log("ENCODER MOUNT");
    }
    
    componentWillUnmount () {
        console.log("UNMOUNT");
    }
    onConcept(concept) {
        this.setState({content:JSON.stringify(concept)});
    }
    render() {
        return (
                <div>
                {this.state.content}
                </div>
        );
    }
}

class AnnotatedCollectionEncoder extends Encoder {
    constructor (props) {
        super(props)
        this.children = [];
        this.concept_rev = null;
        this.state = { children: [], child_properties: []};
    }
    onConcept(concept) {
        // use 'members', 'child_properties' to construct
        // child state.
        let new_child_properties = concept.child_properties || [];
        if(new_child_properties != this.state.child_properties) {
            let new_child_ids = {};
            let new_children = concept.child_properties ?
                concept.child_properties.map(cp => {
                    return this.makeChild(cp, new_child_ids)
                } ).filter(a => a) : [];
            console.log("CHILDREN",new_children);
            this.setState({
                children : new_children,
                child_properties: new_child_properties
            });
        }
        this.concept_rev = concept.rev;
    }
    //a new key UUID:NUM
    childKey(new_child_ids, uu) {
        let j = (new_child_ids[uu] || 0)  + 1;
        new_child_ids[uu] = j;
        return uu + ":" + j;
    }
    makeChild(cp, new_child_ids) {
        return {...cp, '_key': this.childKey(new_child_ids, cp.concept), '_bp':'Encoder' }
    }
    addChild(concept,bp,ann) {
        let cp = {
            '_bp':bp,
            'concept':concept
        }
        this.portal.update(concept, {});
        //todo
        //append to members, child_properties
        
    }
    add = (e) => {
        console.log("ADD");
        this.props.portal.newUForm({name: "new thing"}).then( doc => {
            this.addChild(doc._id,"Encoder",{});
        });
    }
    render() {
        return (
                <div>
                <button onClick={this.add}> ADD </button>
                <div>
                <hr/>
                {
                    this.state.children.map( (child) => {
                        console.log("CHILD",child);
                    return React.createElement(
                        this.props.bpconstructor(child._bp),
                        { ...this.props,
                          concept: child.concept,
                          key: child._key
                        }
                    )
                    })
                }
                <hr/>            
                </div>
                </div>
        );
    }
}

class App extends Component {
    constructor () {
        super()
        this.dbname = "mydb";
        this.rootConcept = "baeb96bfefefab79ab1c75a01d000375";
        this.portal = new Portal(this.dbname);
    }
    bpconstructor(name) {
        if(name === "AnnotatedCollection") return AnnotatedCollectionEncoder;
        else return Encoder;
    }
        
  render() {
    return (
            <div className="App">
            <header className="App-header">
            </header>
            <AnnotatedCollectionEncoder portal={this.portal} concept={this.rootConcept} bpconstructor={this.bpconstructor} />
            </div>
    );
  }
}

export default App;
