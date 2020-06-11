import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

export function EntryEditor() {
  const dispatch = useDispatch();  
  const error = useSelector(store => store.entry_browser.create_errors);
  const [name, set_name] = useState('');
  const [ca_string, set_ca_string] = useState('');

  function on_submit(ev) {
    dispatch({type:'entry.create', value:{name, ca_string}});
    ev.preventDefault();
  }

  let err_fmt = error ? 'is-invalid' : '';
  

  return (
    <form className="px-4 pb-4" onSubmit={on_submit}>
      <h6 className="m-0 font-weight-bold text-secondary mt-3">User Entry</h6>
      <div className="dropdown-divider"></div>
      <div className="form-group row mb-2 mt-2">
        <label className="col-sm col-form-label">Name</label>
        <div className="col-sm-10">
          <input type="text" className="form-control form-control-sm" value={name} onChange={ev => set_name(ev.target.value)}/>
        </div>
      </div>
      <div className="form-group row mb-2">
        <label className="col-sm col-form-label">Rule</label>
        <div className="col-sm-10">
          <input type="text" className={`form-control form-control-sm ${err_fmt}`} id="ca_string" value={ca_string} onChange={ev => set_ca_string(ev.target.value)}/>
          {error ? <div className="invalid-feedback">{error}</div> : <div></div>}
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-sm" style={{float:'right'}}>Add</button>
    </form>
  );
}