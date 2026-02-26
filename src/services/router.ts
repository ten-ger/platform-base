class RouterController {

  async setRoot(url: string) {
    const router = document.querySelector('ion-router');
    await router.push(url, 'root');
  }

  async forwardTo(url: string) {
    const router = document.querySelector('ion-router');
    await router.push(url, 'forward');
  }
  
  async backTo(url: string) {
    const router = document.querySelector('ion-router');
    await router.push(url, 'back');
  }

  async back() {
    const router = document.querySelector('ion-router');
    await router.back();
  }
  
  async checkError(error: any) {

    try {

      let errorString = error as string;
      if (errorString.includes('401') || errorString.includes('403')) {

        let appElem = document.querySelector('ion-app');
        appElem.dispatchEvent(
          new CustomEvent('userAuthChanged', {
            bubbles: true,
            detail: {
              user: null
          }}));
        RouterService.setRoot('/');
      }
    }
    catch (error) {}
  }
}

export const RouterService = new RouterController();