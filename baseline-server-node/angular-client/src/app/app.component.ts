import { Component } from '@angular/core';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular Awesomeness..........';
	loginStatus = 'Not Logged In Sorry';
	public username="";
	password="";
	constructor(private socket: SocketService) {
	}
	submitLogin(): void {
		this.socket.login(this.username, this.password, null).
			then ( 
				resolve => {
					this.loginStatus = 'Success login';
				},
				reject => {
					this.loginStatus = 'Success login... nope';
					console.log(reject);
				}).
			catch ( err => console.log (' crazy error everybody ',err));
	}

  submitLogout() : void {
    this.socket.logout();
  }

  testEmit() : void {
    this.socket.emit('get actions', {data: "bullshit"}).then ( resolve => {
      console.log('result ',resolve);
    }, reject => {
      console.log('error ',reject);
    });
  }

  ngOnInit() {
  }
}
