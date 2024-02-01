const axios = require('axios')
const crypto = require('crypto')

class WebhookController {
    constructor() {}

    writeLog(logName, logData) {
        console.log(`${logName}:`, logData)
    }

    async get_content(URL) {
        try {
            const response = await axios.get(URL)
            return response.data
        } catch (error) {
            throw error
        }
    }

    getStringToSign(message) {
        const signableKeys = [
            'Message',
            'MessageId',
            'Subject',
            'SubscribeURL',
            'Timestamp',
            'Token',
            'TopicArn',
            'Type'
        ] 

        let stringToSign = ''

        if (message.SignatureVersion !== '1') {
            const errorLog = `The SignatureVersion "${message.SignatureVersion}" is not supported.`
            this.writeLog('SignatureVersion-Error', [errorLog])
        } else {
            signableKeys.forEach((key) => {
                if (message[key]) {
                    stringToSign += `${key}\n${message[key]}\n`
                }
            })
            this.writeLog('StringToSign',stringToSign)
        }
        return stringToSign
    }

    validateUrl(url) {
        const defaultHostPattern = /^sns\.[a-zA-Z0-9\-]{3,}\.amazonaws\.com(\.cn)?$/
        const parsed = new URL(url)

        if (
            !parsed.protocol ||
            !parsed.hostname ||
            parsed.protocol !== 'https:' ||
            parsed.pathname.substr(-4) !== '.pem' ||
            !defaultHostPattern.test(parsed.hostname)
        ) {
            return false
        } else {
            return true
        }
    }

    async webhookListener(req, res) {
        const payload = JSON.parse(req.body)
        this.writeLog('Payload', payload)

        const messageType = payload?.Type || req.headers['x-amz-sns-message-type']
        const signingCertURL = payload?.SigningCertURL
        const certUrlValidation = this.validateUrl(signingCertURL)
        
        if (certUrlValidation) {
            try {
                const pubCert = await this.get_content(signingCertURL)
                const signature = Buffer.from(payload?.Signature, 'base64')
                const content = this.getStringToSign(payload)
                if (content) {
                    const verifier = crypto.createVerify('RSA-SHA1')
                    verifier.update(content)
                    const verified = verifier.verify(pubCert, signature)
                    if (!verified) {
                        if (messageType === 'SubscriptionConfirmation') {
                            const subscribeURL = payload?.SubscribeURL
                            const data = await this.get_content(subscribeURL)
                            this.writeLog('Subscribe-Result', data)

                        } else if (messageType === 'Notification') {
                            const notificationData = payload?.Message
                            // Save notificationData in your DB or implement your logic here.
                            this.writeLog('NotificationData-Message', notificationData)
                        }
                    }
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }
}

module.exports = WebhookController
