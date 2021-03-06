module.exports = class MessageCollector {
    /**
     * Create a new MessageCollector singleton
     * @param {import('./client')} client The client
     */
    constructor(client) {
        this.collectors = {};
        client.on('messageCreate', this.verifyMessage.bind(this));
    }

    /**
     * Verifies if the message is from the collector
     * @param {import('eris').Message} msg The message
     */
    verifyMessage(msg) {
        if (!msg.author)
            return;

        const collector = this.collectors[msg.channel.id + msg.author.id];
        if (collector && collector.filter(msg))
            collector.accept(msg);
    }

    /**
     * Await an message
     * @param {(message: import('eris').Message) => boolean} filter The filter
     * @param {AwaitMessageInfo} info The info from the developer
     * @returns {import('./context').PromisedMessage}
     */
    awaitMessage(filter, info) {
        return new Promise((accept) => {
            const { channelID, userID, timeout } = info;
            const collector = this.collectors[channelID + userID];
            if (collector)
                delete this.collectors[channelID + userID];

            this.collectors[channelID + userID] = { filter, accept };
            setTimeout(accept.bind(null, false), timeout * 1000);
        });
    }
}

/**
 * @typedef {object} AwaitMessageInfo
 * @prop {string} channelID The channel ID
 * @prop {string} userID The user ID
 * @prop {number} [timeout=30] The timeout to wait
 */