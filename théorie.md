SignalR
Objectif
Permettre à notre serveur d’envoyer du data à un ou des client(s) quand on veut. (Donc c'est le serveur et non le client qui déclenche l'envoi)
On veut donc éviter d’utiliser la solution de « polling » où le client fait des requêtes très fréquemment pour savoir si il y a du nouveau data.
Half-duplex
C’est le type de communication que vous connaissez déjà très bien.
Le client peut non seulement envoyer des données, mais également recevoir une réponse qui contient également des données.
L’échange va dans les deux sens, mais uniquement lorsque le client fait une demande.
Full-duplex
L’information peut communiquer librement dans les deux directions.
Le serveur peut donc envoyer des requêtes avec des données à un ou des clients qui peuvent lui retourner des données.
Web Sockets
Websockets permet de faire une communication full-duplex depuis .Net 7.
Les websockets font parties de .Net Core et sont utilisable directement à l’intérieur d’un Controller.
public class WebSocketController : ControllerBase {
    [Route("/ws")]
    public async Task Get() {
        if (HttpContext.WebSockets.IsWebSocketRequest) {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            await MaFonctionDeCommunication(webSocket);
        }
        else {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
}

SignalR
C’est généralement préférable de ne pas utiliser des websockets directement et d’utiliser une libraire comme SignalR.
SignalR est une technologie qui utilise des websockets et qui fournit de nombreuses fonctionnalités très utiles!
Le protocol
Avec websockets et SignalR, il faut d’abord établir une connection avant de pouvoir communiquer de façon full-duplex.

Alt text

Fonctionnalités SignalR
Avec SignalR, on peut utiliser un Hub pour:

Établir une connexion full-duplex
Répondre à des requêtes des clients
Envoyer des requêtes aux clients qui peuvent être exécutés comme des fonctions
Créer des groupes de clients pour leur envoyer des requêtes
Utiliser [Authorize]
Hub
C’est l’équivalent d’un contrôleur, mais pour SignalR.
C’est dans un hub que l’on va écrire tout notre code pour gérer notre communication avec les clients.
Un Hub est simplement une classe qui hérite de la classe Hub
Par convention, on met les classes de Hub dans le répertoirs /Hubs/
Fonctionnalités du Hub
Traiter des requêtes
// Recevoir une requête
// Appeler une fonction sur le client avec la même donnée
public async Task FaireUnEcho(int value)
{
    await Clients.Caller.SendAsync("UneFonctionClient", value);
}

// Recevoir une requête
// Appeler une fonction sur TOUS les client avec la même donnée 
public async Task EnvoyerAuxAutres(int value)
{
    await Clients.All.SendAsync("UneFonctionClient", value);
}

Envoyer des données à une connection
// Appeler une connection
public async Task EnvoyerAUneConnection(int value, string connectionId)
{
    await Clients.Client(connectionId).SendAsync("UneFonctionClient", value);
}

C'est quoi un connectionId?
Comme son nom l'indique, c'est l'Id de la connection établie entre le serveur et le client. Il n'est PAS unique par utilisateur et si la même page ouvre 2 connections différentes, il y aura 2 connectionIds différents.

Envoyer des données à un usager
// Appeler un usager
public async Task EnvoyerAUnUsager(int value, string userId)
{
    await Clients.User(userId).SendAsync("UneFonctionClient", value);
}

info
Comme un User peut se connecter plusieurs fois au même Hub, il est possible que ce code envoit l'information à plusieurs instances différentes (Par exemple, deux fenêtres d'un navigateur connecté à ce serveur).

Gérer des groupes
await Groups.RemoveFromGroupAsync(Context.ConnectionId, "ancienGroupe");
await Groups.AddToGroupAsync(Context.ConnectionId, "nouveauGroupe");

Appeler un groupe d’usager
// Appeler un groupe
public async Task EnvoyerAUnUsager(int value, string groupName)
{
    await Clients.Group(groupName).SendAsync("UneFonctionClient", value);
}

Possible de faire de nombreux appels!
public async Task FairePlusieursChoses(int valueA, int valueB, string groupName)
{
    // Appeler la méthode UneFonctionClient sur les clients qui font partie du groupe nommé groupName
    await Clients.Group(groupName).SendAsync("UneFonctionClient", valueA);
    // Appeler la méthode UneAutreFonctionClient sur tous les clients connectés à ce Hub
    await Clients.All.SendAsync("UneAutreFonctionClient", resultB);
}

Possible d'envoyer plusieurs paramètres
(Voir la section Écouter plusieurs paramètres)

public async Task EnvoyerPlusieursParametres()
{
    int a = 42;
    int b = 33;
    string c = "test";
    // Appeler la méthode UneAutreFonctionClient sur tous les clients connectés à ce Hub
    await Clients.All.SendAsync("PlusieursParametres", a, b, c);
}

Pour faire une action lors d'une connection ou déconnection au Hub
public override async Task OnConnectedAsync()
{
    base.OnConnectedAsync();
    // TODO: Ajouter votre logique
}

public override async Task OnDisconnectedAsync(Exception? exception)
{
    base.OnDisconnectedAsync(exception);
    // TODO: Ajouter votre logique
}

Hub et [authorize]
On peut mettre un [Authorize] sur un Hub.
On peut alors utiliser Context.UserIdentifier pour obtenir le userId de l’utilisateur qui a fait la requête.
Enregistrer un hub
Il faut enregistrer notre Hub dans Program.cs

builder.Services.AddSignalR();

//...

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapHub<MatchHub>("/matchHub");

Côté Angular
La librairie "@microsoft/signalr" permet de communiquer facilement avec un hub.

Connection
connectToHub() {
    // On doit commencer par créer la connexion vers le Hub
    this.hubConnection = new signalR.HubConnectionBuilder()
                              .withUrl('https://localhost:7060/chat')
                              .build();

    // On peut commencer à écouter pour les évènements qui vont déclencher des callbacks
    this.hubConnection!.on('UneFonction', (data) => {
        // data a le même type que ce qui a été envoyé par le serveur
        console.log(data);
    });
    
    this.hubConnection!.on('UneAutreFonction', (data) => {
        console.log(data);
    });

    // On se connecte au Hub  
    this.hubConnection
        .start()
        .then(() => {
            console.log('La connexion est active!');
          })
        .catch(err => console.log('Error while starting connection: ' + err));
}

attention
Le moment est important!

    this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.apiUrl + 'monHub')
        .build();

    // Il faut écouter les messages avant de faire start() sur la connection. On ne risque pas d'avoir un problème où le message est reçu avant même d'avoir exécuté le .on
    // ATTENTION: Ce problème risque d'arriver beaucoup plus souvent dans une version DÉPLOYÉE de l'application
    this.hubConnection?.on("DoSomething", (data:number) => {
        // Faire quelque chose
    });

    this.hubConnection
        .start()
        .then(() => {
            this.isConnected = true;
            // Ne PAS faire de .on() ICI
        });



Écouter plusieurs paramètres
(Voir la section Possible d'envoyer plusieurs paramètres)

this.hubConnection?.on("PlusieursParametres", (a:number, b:number, c:string) => {
    // Faire quelque chose
});

Appel d'une action sur le Hub
Une fois la connexion établit, on peut appeler les méthodes que l’on veut sur notre Hub.

faireQuelqueChose() {
    this.hubConnection!.invoke('FaireQuelqueChose', this.uneString, 42);
}

Cycle de vie
Les connections peuvent être fermées de chaque côté
Les connections ont une durée de vie (2 minutes par défaut)
La durée de vie est remise à zéro chaque fois que le client envoit une requête
Un client peut envoyer un message « keep alive » pour garder une connexion ouverte sans envoyer de données

























Reactive Forms
Créer un nouveau projet
Créer un nouveau projet Angular
ng new ngReactiveForms

Les autres options ne sont pas importantes.
Création d'un premier formulaire
Validation dynamique
On peut afficher des messages d'erreurs directement sur les champs
image

Configuration
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControlOptions, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';



@Component({
  selector: 'app-exercice',
  standalone: true,
  imports: [ReactiveFormsModule, MatTabsModule, CommonModule, MatError, MatFormField, MatCard, MatInput],
  templateUrl: './exercice.component.html',
  styleUrls: ['./exercice.component.css']
})


ReactiveFormsModule nous permet de faire de la validation dynamique sur les champs d'un formulaire
MatError de Material nous permet d'afficher facilement les messages d'erreurs sous les champs du formulaire
attention
Il faut installer Material pour utiliser MatInput

ng add @angular/material

Injecter Formbuilder
Il faut injecter formBuilder dans le component où l'on veut ajouter notre formulaire.

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  constructor(private fb: FormBuilder) {}
  //...
}

Utiliser le FormBuilder
Créer un groupe de validation à partir du FormBuilder
Chaque champ du formulaire que l'on doit valider peut avoir un ou plusieurs validateurs
form = this.fb.group({
  email: ["", [Validators.required, Validators.email]],
  name: ["", [Validators.required]],
});

Les Validators
Il existe plusieurs Validators par défaut
Vous retrouverez les mêmes Validations que l'on peut mettre sur un modèle en C#
image

Créer un Validator
On peut créer des "custom" validator et les affecter à un champ du groupe

form = this.fb.group({
  email: ["", [Validators.required, Validators.email]],
  name: ["", [Validators.required, this.myCustomValidator]],
});

Exemple sur un control
myCustomValidator(control: AbstractControl): ValidationErrors | null {
  // On récupère la valeur du champ texte
  const email = control.value;
  // On regarde si le champ est rempli avant de faire la validation
  if (!email) {
    return null;
  }
  // On fait notre validation
  let formValid = email.includes('@gmail.com');
  // Si le formulaire est invalide on retourne l'erreur
  // Si le formulaire est valide on retourne null
  return !formValid?{gmailValidator:true}:null;
}

Validator sur plusieurs champs
On peut également utiliser un Validator custom sur le formulaire pour faire une validation sur plusieurs champs (ex. Mot de passe et confirmation)

form = this.fb.group(
  {
    email: ["", [Validators.required, Validators.email]],
    name: ["", [Validators.required]],
  },
  { validators: this.myCustomValidator }
);

Exemple sur un form
myCustomValidator(form: AbstractControl): ValidationErrors | null {
  // On récupère les valeurs de nos champs textes
  const email = form.get('email')?.value;
  const name = form.get('name')?.value;
  // On regarde si les champs sont remplis avant de faire la validation
  if (!email || !name) {
    return null;
  }
  // On fait notre validation
  let formValid = email.includes(name);

  // Si le formulaire est invalide on retourne l'erreur
  // Si le formulaire est valide on retourne null
  return !formValid?{nameInEmail:true}:null;
}

form.valueChanges
Pour récupérer les données du formulaire, nous utiliserons un Observable sur l'évènement valueChanges
Il faudra aussi avoir créé une classe (ou une interface) du même type que le formulaire
Il faudra finalement créer une variable du type du formulaire
// interface qui décris le type du formulaire
interface Data {
  email?: string | null;
  name?: string | null;
}
export class RegisterComponent implements OnInit {
  // Le component contient une variable du même type que les champs du formulaire
  formData?: Data;
  ngOnInit(): void {
    // À chaque fois que les valeurs changent, notre propriété formData sera mise à jour
    this.form.valueChanges.subscribe(() => {
      this.formData = this.form.value;
    });
  }
  //...
}

setErrors
C'est également possible de mettre une erreur directement sur un control à l'intérieur d'une validation

if (error) {
  form.get("email")?.setErrors({ nameInEmail: true });
} else {
  form.get("email")?.setErrors(null);
}

danger
Il faut être prudent avec l'utilisation de setErrors, surtout setErrors(null), car elle écrase les erreurs qui existent déjà!

Version complète
@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  form: FormGroup<any>;
  // Le component contient une variable du même type que les champs du formulaire
  formData?: Data;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        email: [
          "",
          [Validators.required, Validators.email, this.gmailValidator],
        ],
        name: ["", [Validators.required]],
      },
      { validators: this.myCustomValidator }
    );

    // À chaque fois que les valeurs changent, notre propriété formData sera mise à jour
    this.form.valueChanges.subscribe(() => {
      this.formData = this.form.value;
    });
  }

  gmailValidator(control: AbstractControl): ValidationErrors | null {
    // On récupère la valeur du champ texte
    const email = control.value;
    // On regarde si le champ est rempli avant de faire la validation
    if (!email) {
      return null;
    }
    // On fait notre validation
    let formValid = email.includes("@gmail.com");
    // On mets les champs concernés en erreur
    // Si le formulaire est invalide on retourne l'erreur
    // Si le formulaire est valide on retourne null
    return !formValid ? { gmailValidator: true } : null;
  }
  myCustomValidator(form: AbstractControl): ValidationErrors | null {
    // On récupère les valeurs de nos champs textes
    const email = form.get("email")?.value;
    const name = form.get("name")?.value;
    // On regarde si les champs sont remplis avant de faire la validation
    if (!email || !name) {
      return null;
    }
    // On fait notre validation
    let formValid = email.includes(name);
    // Si le formulaire est invalide on retourne l'erreur
    // Si le formulaire est valide on retourne null
    return !formValid ? { nameInEmail: true } : null;
  }
}
// interface qui décris le type du formulaire
interface Data {
  email?: string | null;
  name?: string | null;
}

L'utilisation de ReactiveForms dans la vue
Ajouter le groupe de validation au formulaire hmtl
<form [formGroup]="form">...</form>

Ajouter les champs textes
<mat-form-field style="width: 100%">
  <input
    matInput
    type="text"
    placeholder="Votre nom"
    formControlName="name"
    name="name"
  />
  <mat-error *ngIf="form.get('name')?.hasError('required')">
    Votre nom est <strong>requis</strong>
  </mat-error>
  <mat-error *ngIf="form.hasError('nameInEmail')">
    Le nom doit être dans l'adresse courriel
  </mat-error>
</mat-form-field>

formControlName="name"
On lie le champ texte au contrôle "name" dans le groupe du formulaire (groupe de validation)
form.get('name')?.hasError('required')
On vérifie s'il y a une erreur de type required sur le champ
form.hasError('nameInEmail')
On regarde s'il y a notre erreur "custom" sur l'ensemble du formulaire
mat-error
On affiche un message d'erreur sous le champ texte
<mat-error *ngIf="form.hasError('nameInEmail')">
  Le nom doit être dans l'adresse courriel
</mat-error>

Version finale

<div
  style="width: 100%;height: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column"
>
  <mat-card class="artist-card" style="margin: 16px; padding: 16px;">
    <form [formGroup]="form">
      <mat-form-field style="width: 100%">
        <input
          matInput
          type="email"
          placeholder="Courriel"
          formControlName="email"
          name="email"
        />
        <mat-error
          *ngIf="form.get('email')?.errors?.['email'] && !form.get('email')?.hasError('required')"
        >
          Entrer une adresse courriel valide
        </mat-error>
        <mat-error
          *ngIf="form.get('email')?.hasError('gmail') && !loginForm.get('email')?.errors?.['email']"
        >
          Le courriel doit venir de <strong>Google</strong>
        </mat-error>
        <mat-error *ngIf="form.get('email')?.hasError('required')">
          Le courriel est <strong>requis</strong>
        </mat-error>
      </mat-form-field>
      <mat-form-field style="width: 100%">
        <input
          matInput
          type="text"
          placeholder="Votre nom"
          formControlName="name"
          name="name"
        />
        <mat-error *ngIf="form.get('name')?.hasError('required')">
          Votre nom est <strong>requis</strong>
        </mat-error>
        <mat-error *ngIf="form.hasError('nameInEmail')">
          Le nom doit être dans l'adresse courriel
        </mat-error>
      </mat-form-field>
      <button mat-raised-button color="primary" [disabled]="!form.valid">
        Enregistrer
      </button>
    </form>
  </mat-card>
</div>