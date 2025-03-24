using Microsoft.AspNetCore.SignalR;
using SignalR.Services;

namespace SignalR.Hubs
{
    public class PizzaHub : Hub
    {
        private readonly PizzaManager _pizzaManager;

        public PizzaHub(PizzaManager pizzaManager) {
            _pizzaManager = pizzaManager;
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();

            _pizzaManager.AddUser();

            await Clients.All.SendAsync("UpdateNbUsers", _pizzaManager.NbConnectedUsers);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnConnectedAsync();

            _pizzaManager.RemoveUser();

            await Clients.All.SendAsync("UpdateNbUsers", _pizzaManager.NbConnectedUsers);
        }

        public async Task SelectChoice(PizzaChoice choice)
        {
            string zbeub = _pizzaManager.GetGroupName(choice);
            int money = _pizzaManager.Money[(int)choice];
            int price = _pizzaManager.PIZZA_PRICES[(int)choice];
            int nbPizza = _pizzaManager.NbPizzas[(int)choice];

            int[] zbeub2 = [money, nbPizza];

            await Groups.AddToGroupAsync(Context.ConnectionId, zbeub);

            await Clients.Group(zbeub).SendAsync("UpdateNbPizzasAndMoney", zbeub2);
            await Clients.Caller.SendAsync("UpdatePizzaPrice", price);
        }

        public async Task UnselectChoice(PizzaChoice choice)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, _pizzaManager.GetGroupName(choice));
        }

        public async Task AddMoney(PizzaChoice choice)
        {
            _pizzaManager.IncreaseMoney(choice);

            await Clients.Caller.SendAsync("UpdateMoney", _pizzaManager.Money[(int)choice]);
        }

        public async Task BuyPizza(PizzaChoice choice)
        {
            _pizzaManager.BuyPizza(choice);

            string zbeub = _pizzaManager.GetGroupName(choice);
            int money = _pizzaManager.Money[(int)choice];
            int nbPizza = _pizzaManager.NbPizzas[(int)choice];

            int[] zbeub2 = [money, nbPizza];

            await Groups.AddToGroupAsync(Context.ConnectionId, zbeub);

            await Clients.Group(zbeub).SendAsync("UpdateNbPizzasAndMoney", zbeub2);
        }
    }
}
