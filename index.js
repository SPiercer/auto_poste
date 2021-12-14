const functions = require("firebase-functions");
const pptr = require("puppeteer");

// const fs = require('fs');

exports.helloWorld = functions.https.onRequest((request, response) => {
  // const userUUID = request.body.email;
  var body = JSON.parse(request.body)
  const seconds = body.seconds;
  (async () => {

    // create dir if does not exist
    // const dir = `${userUUID}/data`;
    // if (!fs.existsSync(dir)) {
    //   fs.mkdirSync("dir");
    // }

    const browser = await pptr.launch({
      // userDataDir: "data",
      // headless: false,
    });

    /// login
    //   TODO :: if not logged in login
    await login(body.email, body.password, browser);

    const post = body.post;
    const groups = body.groups;
    console.log(groups)
    /// spam in groups ⚡
    await spam(post, groups, browser);

    /// kill the browser
    await browser.close();
    response.send("it should be done");
  })();

  async function spam(post, groups, browser) {
    for (let i = 0; i < groups.length; i++) {
      await postInGroup(groups[i], post, browser);
      //  await 5 seconds
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }
  }
  /// post in single group
  async function postInGroup(group, post, browser) {
    const page = await browser.newPage();
    /// * open group
    await page.goto(group);
    /// * open post dialog
    await page.evaluate(() => {
      document.querySelectorAll("div[role=button]")[1].click();
    });
    /// * await
    await page.waitForNetworkIdle();
    /// * type post
    await page.evaluate((post) => {
      ///  * write the post
      document.querySelector("input[name='message']").value = JSON.stringify(post);
      /// * submit the post
      document.querySelector("#structured_composer_form").submit();
    }, post);

    //   await page.waitForNetworkIdle();
    //   await page.close();
  }
  async function login(email, password, browser) {

    const page = await browser.newPage();
    await page.goto("https://m.facebook.com");
    await page.waitForNetworkIdle();
    await page.type("#m_login_email", email);
    await page.type("#m_login_password", password);
    await page.click("button[name='login']");
    await page.waitForNetworkIdle();
  }

});
