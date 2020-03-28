import React from 'react';
import { withAuthenticator } from 'aws-amplify-react';

class App extends React.Component {
  state = {
    notes: [{
      id: 1,
      note: 'Hello world'
    }]
  }

  render(){
    const {notes} = this.state;

    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>
        {/* Note Form */}
        <form action="" className="mb3">
          <input type="text"
            name="" 
            id="" 
            className="pa2 f4"
            placeholder="Write your note"/>
          <button type="submit">
            Add Note
          </button>
        </form>
        {/* Notes List */}
        <div>
          {notes.map(item=>(
            <div key={item.id} className="flex flex-row">
              <li className="list pa1 f3">
                {item.note}
              </li>
              <button className="bg-transparent bn f4">
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
