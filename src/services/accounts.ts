class AccountsController {

  async getAccounts() {
    return [
      { id: 'acct1', name: "Account 1" },
      { id: 'acct2', name: "Account " },
    ]
  }
}

export const AccountsService = new AccountsController();