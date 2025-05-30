import { Component } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { MatButtonModule } from '@angular/material/button';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [MatButtonModule]
})
export class AppComponent {
  title = 'Pizza Hub';

  private hubConnection?: signalR.HubConnection;
  isConnected: boolean = false;

  selectedChoice: number = -1;
  nbUsers: number = 0;

  pizzaPrice: number = 0;
  money: number = 0;
  nbPizzas: number = 0;

  constructor(){
    this.connect();
  }

  connect() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5282/hubs/pizza')
      .build();

    // TODO: Mettre isConnected à true seulement une fois que la connection au Hub est faite
    this.hubConnection!.on('UpdateNbUsers', (data) => {
      console.log(data);
      this.nbUsers = data
  });

  // On se connecte au Hub  
  this.hubConnection
      .start()
      .then(() => {
          console.log('La connexion est active!');
          this.isConnected = true;
        })
      .catch(err => console.log('Error while starting connection: ' + err));
    
  }

  selectChoice(selectedChoice:number) {
    this.selectedChoice = selectedChoice;

    this.hubConnection!.invoke('SelectChoice', selectedChoice);
    this.hubConnection!.on('UpdateNbPizzasAndMoney' ,(data) => {
      console.log(data)
      this.money = data[0]
      this.nbPizzas = data[1]
    })
    this.hubConnection!.on('UpdatePizzaPrice' ,(data) => {
      console.log(data)
      this.pizzaPrice = data
    })
  }

  unselectChoice() {
    this.selectedChoice = -1;
    this.hubConnection!.invoke('UnselectChoice', this.selectedChoice);
    
  }

  addMoney() {
    this.hubConnection!.invoke('AddMoney', this.selectedChoice);
    this.hubConnection!.on('UpdateMoney' ,(data) => {
      console.log(data)
      this.money = data
    })
    
  }

  buyPizza() {
    this.hubConnection!.invoke('BuyPizza', this.selectedChoice);
    this.hubConnection!.on('UpdateNbPizzasAndMoney' ,(data) => {
      console.log(data)
      this.money = data[0]
      this.nbPizzas = data[1]
    })

  }
}
