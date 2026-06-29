import "./dashboard.css";

import { useEffect, useState } from "react";
import goalService from "../../services/goalService";
import useAuth from "../../hooks/useAuth";

export default function DashboardPage(){

const {user}=useAuth();

const [goals,setGoals]=useState([]);

useEffect(()=>{

loadGoals();

},[]);

async function loadGoals(){

try{

setGoals(await goalService.getGoals());

}catch(e){

console.log(e);

}

}

const completed=goals.filter(
g=>g.status==="COMPLETED"
).length;

return(

<div className="dashboard fade">

<div className="dashboard-header">

<h1>

Welcome back,

<br/>

{user.username}

</h1>

<p>

AI Powered Productivity Platform

</p>

</div>

<div className="dashboard-grid">

<div className="card stat-card">

<h2>Total Goals</h2>

<h1>{goals.length}</h1>

</div>

<div className="card stat-card">

<h2>Completed</h2>

<h1>{completed}</h1>

</div>

<div className="card stat-card">

<h2>Pending</h2>

<h1>{goals.length-completed}</h1>

</div>

</div>

<div className="card">

<h2>Recent Goals</h2>

<br/>

<div className="goal-list">

{

goals.map(goal=>(

<div
className="goal-item"
key={goal.id}
>

<div>

<h3>{goal.title}</h3>

<p>{goal.description}</p>

</div>

<strong>

{goal.status}

</strong>

</div>

))

}

</div>

</div>

</div>

);

}