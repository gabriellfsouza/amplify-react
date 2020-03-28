import React, { useState, useEffect } from 'react';
import {API, Auth, graphqlOperation} from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import {createNote, deleteNote, updateNote} from './graphql/mutations';
import {listNotes} from './graphql/queries';
import {onCreateNote, onDeleteNote, onUpdateNote} from './graphql/subscriptions';

function AppHooks() {
  const [id, setId] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);


  useEffect(()=>{
    let createNoteListener;
    let deleteNoteListener;
    let updateNoteListener;
    async function x(){
      getNotes();
      const user = await Auth.currentUserInfo();
      console.log(user);
      createNoteListener = API.graphql(graphqlOperation(onCreateNote, {owner: user.username})).subscribe({
        next: noteData => {
          const newNote = noteData.value.data.onCreateNote;
          setNotes(prevNotes=> {
            const oldNotes = prevNotes.filter(note=> note.id !== newNote.id);
            const updatedNotes = [...oldNotes, newNote];
            return updatedNotes;
          });
          setNote('');
        }
      });
      deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote, {owner: user.username})).subscribe({
        next: noteData => {
          const deletedNote = noteData.value.data.onDeleteNote;
          setNotes(prevNotes=>prevNotes.filter(note=>note.id!==deletedNote.id));
        }
      });
      updateNoteListener = API.graphql(graphqlOperation(onUpdateNote, {owner: user.username})).subscribe({
        next: noteData => {
          const updatedNote = noteData.value.data.onUpdateNote;
          setNotes(prevNotes=>{
            const index = prevNotes.findIndex(node=>node.id===updatedNote.id);
            return [...prevNotes.slice(0,index), updatedNote, ...prevNotes.slice(index + 1)];
          });
          setNote('');
          setId('');
        }
      });
      
    }
    x();
    return ()=>{
      if(createNoteListener) createNoteListener.unsubscribe();
      if(deleteNoteListener) deleteNoteListener.unsubscribe();
      if(updateNoteListener) updateNoteListener.unsubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const getNotes = async() =>{
    const result = await API.graphql(graphqlOperation(listNotes));
    setNotes(result.data.listNotes.items)
  }

  const handleChangeNote = event => setNote(event.target.value)
  
  const hasExistingNote = ()=>{
    if(id) {
      //is the id a valid id?
      const isNote = notes.findIndex(note=>note.id === id) > -1;
      return isNote;
    }
    return false;
  }

  const handleAddNote = async event => {
    event.preventDefault();
    const input = { note };
    // check if we have an existing note, if so update it
    if(hasExistingNote()) return handleUpdateNote();
      
    await API.graphql(graphqlOperation(createNote,{ input }));
  }

  const handleDeleteNote = async noteId =>{
    const input = {id:noteId};
    await API.graphql(graphqlOperation(deleteNote,{input}));
  }

  const handleSetNote = ({note,id}) =>  {
    setNote(note); 
    setId(id);
  };

  const handleUpdateNote = async () => {
    const input = {id,note};
    await API.graphql(graphqlOperation(updateNote,{ input }));
  }


  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-l">Amplify Notetaker</h1>
      {/* Note Form */}
      <form onSubmit={handleAddNote} className="mb3">
        <input type="text"
          name="" 
          id="" 
          className="pa2 f4"
          placeholder="Write your note" onChange={handleChangeNote}
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
            <li onClick={()=>handleSetNote(item)} className="list pa1 f3">
              {item.note}
            </li>
            <button onClick={()=>handleDeleteNote(item.id)} className="bg-transparent bn f4">
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuthenticator(AppHooks, { includeGreetings: true });
