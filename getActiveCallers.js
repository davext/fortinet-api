const {Builder, By, Key, until, Capabilities, Capability} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('dotenv').config()
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const capabilities = Capabilities.chrome();
capabilities.set(Capability.ACCEPT_INSECURE_TLS_CERTS, true);

const chromeOptions = new chrome.Options()
chromeOptions.detachDriver(true)

let driver

const getActiveCallers = async () => {


  return new Promise(async (resolve, reject) => {


    if(!driver){

      try{
        driver = await new Builder().withCapabilities(capabilities)
        .forBrowser('chrome').setChromeOptions(chromeOptions)
        .build();

      }catch (e){

        // console.log(e)
        reject(e);
      }
    }

    try {
      await delay(1000)

      try{
        await driver.get(
            `https://${process.env.INTERNAL_IP}/admin/Admin.html#/monitor/all_status`)
      }catch (e){
        driver = await new Builder().withCapabilities(capabilities)
        .forBrowser('chrome').setChromeOptions(chromeOptions)
        .build();
        await driver.get(
            `https://${process.env.INTERNAL_IP}/admin/Admin.html#/monitor/all_status`)
      }

      await delay(1000)

      driver.wait(until.elementLocated(By.id('aname')), 10 * 1000).then(
          async el => {

            //need to login

            await delay(1000)
            el.sendKeys(process.env.USERNAME);
            await delay(1000)

            driver.wait(until.elementLocated(By.id('apass')), 10 * 1000).then(
                async passEl => {
                  passEl.sendKeys(process.env.PASS);
                  await delay(1000)
                  passEl.sendKeys(Key.ENTER);
                  await delay(1000)
                });

          }).catch(async () => {

        //already in
        await driver.get(
            `https://${process.env.INTERNAL_IP}/admin/Admin.html#/monitor/all_status`)

        driver.wait(until.elementLocated(By.className('f-grid-total-count')),
            10 * 1000).then(
            async el => {
              resolve(el.getText())

            }).catch(e => {
              reject(e)
        });

      });


      await driver.get(
          `https://${process.env.INTERNAL_IP}/admin/Admin.html#/monitor/all_status`)

      driver.wait(until.elementLocated(By.className('f-grid-total-count')),
          10 * 1000).then(
          async el => {
            resolve(el.getText())

          }).catch(e => {
        reject(e)
      });

    } catch (e) {
      reject(e);
      console.error(e)
    }

  })


}




const express = require('express')
const app = express()
const port = 3080

app.get('/api', async (req, res) => {

  let systemResponse

  try{
    const htmlResponse = await getActiveCallers()
    systemResponse = {currentCalls : htmlResponse.split(":")[1], status : "success", timestamp : new Date().toISOString()}

  }catch(e){
    console.log(e)
    systemResponse = {currentCalls : "1", status : "error"}
  }

  // res.send(await getActiveCallers())
  res.json(systemResponse)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
