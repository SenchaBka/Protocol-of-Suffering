import { useEffect, useState } from "react";
function App(){
  const [msg,setMsg]=useState("");
  useEffect(()=>{fetch("http://localhost:3001/api/hello").then(r=>r.json()).then(d=>setMsg(d.msg));},[]);
  return <h1 className="text-2xl font-bold text-blue-600">{msg || "Loading..."}</h1>;
}
export default App;
