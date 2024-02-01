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
