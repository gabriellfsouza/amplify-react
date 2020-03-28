import React from 'react';
import {API, graphqlOperation} from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import {createNote, deleteNote, updateNote} from './graphql/mutations';
import {listNotes} from './graphql/queries';

class App extends React.Component {
  state = {
    id: '',
    note: '',
    notes: []
  }

  async componentDidMount(){
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items })
  }

  handleChangeNote = event => this.setState({note: event.target.value })
  
  hasExistingNote = ()=>{
    const {notes,id} = this.state;
    if(id) {
      //is the id a valid id?
      const isNote = notes.findIndex(note=>note.id === id) > -1;
      return isNote;
    }
    return false;
  }

  handleAddNote = async event => {
    const {note, notes} = this.state;
    event.preventDefault();
    const input = { note };
    // check if we have an existing note, if so update it
    if(this.hasExistingNote()) return this.handleUpdateNote();
      
    const result = await API.graphql(graphqlOperation(createNote,{ input }));
    const newNote = result.data.createNote;
    const updatedNotes = [newNote,...notes]
    this.setState({notes:updatedNotes, note: ''});
  }

  handleDeleteNote = async noteId =>{
    const {notes} = this.state;
    const input = {id:noteId};
    const result = await API.graphql(graphqlOperation(deleteNote,{input}));
    const deletedNoteId = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note=>note.id !== deletedNoteId);
    this.setState({notes: updatedNotes});
  }

  handleSetNote = ({note,id}) => this.setState({note,id});

  handleUpdateNote = async () => {
    const {id,note, notes} = this.state;
    const input = {id,note};
    const result = await API.graphql(graphqlOperation(updateNote,{ input }));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id===updatedNote.id);
    const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index+1)
    ];
    this.setState({notes:updatedNotes,note:'',id:''});
  }

  render(){
    const {notes, note, id} = this.state;

    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>
        {/* Note Form */}
        <form onSubmit={this.handleAddNote} className="mb3">
          <input type="text"
            name="" 
            id="" 
            className="pa2 f4"
            placeholder="Write your note" onChange={this.handleChangeNote}
            value={note}
          />
          <button type="submit">
            {id ? 'Update Note' : 'Add Note'}
          </button>
        </form>
        {/* Notes List */}
        <div>
          {notes.map(item=>(
            <div key={item.id} className="flex flex-row">
              <li onClick={()=>this.handleSetNote(item)} className="list pa1 f3">
                {item.note}
              </li>
              <button onClick={()=>this.handleDeleteNote(item.id)} className="bg-transparent bn f4">
                <span>&times;</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
