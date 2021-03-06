import React from "react";
import styles from "pages/Leaderboard.css";


export default class Leaderboard extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			loading:true,
			leaders:[],
		}
		this.url = "";
		this.ws = null;
	}

	handleSocketMsg(msg){
		console.dir(msg);
		const j = JSON.parse(msg.data);
		let leaders = this.state.leaders.concat(j);
		leaders.sort((a,b)=> (b.score - a.score));
		leaders = leaders.slice(0, 50); // first 50 items
		this.setState({leaders});
	}

	connectSocket(){
		fetch("/api/getWsUrl", {method:"GET"})
			.then(res => {
				if(res.ok){
					return res.json();
				}else{
					return Promise.reject(new Error("Bad response from live service"));
				}
			})
			.then(j => {
				this.wsUrl = j.url;
				this.ws = new WebSocket(j.url);
				this.ws.addEventListener(
					"message", 
					msg => this.handleSocketMsg(msg)
				);
			})
			.catch(e => {
				console.log(e);
				alert("Error: Can't get WS URL for live updates")
			});
	}

	fetchScores(){
		fetch("/api/top", {method:"GET"})
			.then(res => {
				if(res.ok){
					return res.json();
				}else{
					return Promise.reject(new Error("Error: Can't load leaders"));
				}
			})
			.then(j => {

				console.dir(j);
				this.setState({leaders:j.results, loading:false});
			})
			.catch(err => console.log(err));
	}

	componentDidMount(){
		// Load the current top 50, connect to the socket.
		this.fetchScores();
		this.connectSocket();
	}

	componentWillUnmount(){
		// Disconnect the socket.
		this.ws.close();
	}


	render(){
		return <div>
			{this.state.loading?
				<h2>Loading leaders...</h2>
				:<div className={styles.scoresContainer}> 
					{this.state.leaders.map((e, i)=> <div className={styles.score} key={e.id}>
						<div className={styles.place}>{i + 1}</div>
						<div className={styles.name}>{e.name}</div>
						<div className={styles.scoreNumber}>{e.score}</div>
					</div>)}
				</div>
			}
		</div>
	}
}
