
# bKash Webhook
```
bKash merchant user will notify instant payment notification from bKash through shared webhook endpoint. bKash will notify subscription payload once but will notify payment payload after every successful transactions.Both payload format is text.
```
# index.js Setup
```
require("dotenv").config()
const express = require("express")
const WebhookController = require('./controller/WebhookController')
const app = express()
const port = process.env.PORT || 5000

app.use(express.text())

const webhookController = new WebhookController()
app.post('/bkash-webhook', async(req, res) => {
   await webhookController.webhookListener(req, res)
   res.status(200).end() 
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
)

```
# Add Controller
```
Create a new Controller named 'WebhookController.js'
Controller Location --- controller\WebhookController.js
You can now copy paste whole code from this project 'WebhookController.js'
```
# bKash Requirement
```
(1) Merchant Name
(2) Merchant wallet Number(s)
(3) Notification channel email address
(4) Webhook Endpoint
```
# Dependencies
```
axios & crypto
```
