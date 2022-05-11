const request = require('request')

module.exports = {
  defaultConfig: {
    enabled: true
  },
  pluginName: 'SWISync',
  pluginDescription: 'Sync to SW Info',
  init(proxy, config) {
    proxy.log({ type: 'info', source: 'plugin', name: this.pluginName, message: `${this.pluginName} loaded!` })

    proxy.on('apiCommand', (req, resp) => {
      if (config.Config.Plugins[this.pluginName].enabled) {

        const { command, wizard_id: wizardId } = req
        const wizardName = resp?.wizard_info?.wizard_name

        if (command === 'BattleDungeonResult' || command === 'BattleDungeonResult_V2') {
          proxy.log({
            type: 'info',
            source: 'plugin',
            name: `${this.pluginName} [${wizardName}]`,
            message: `${this.pluginName} got a command! ${command}`
          })

          const options = {
            method: 'post',
            uri: `http://localhost:8081/api/v1/commands/${command}/${wizardId}`,
            json: true,
            body: { req, resp }
          }

          request(options, (error, response) => {

            if (error) {
              proxy.log({ type: 'error', source: 'plugin', name: this.pluginName, message: `Error: ${error.message}` })
              return
            }

            if (response.statusCode === 200) {
              proxy.log({ type: 'success', source: 'plugin', name: `${this.pluginName} [${wizardName}]`, message: `${command} logged successfully!` })
            } else if (response.statusCode !== 200) {
              proxy.log({
                type: 'error',
                source: 'plugin',
                name: `${this.pluginName} [${wizardName}]`,
                message: `Request failed: Server responded with code: ${response.statusCode} and message: ${response.body}`
              })
            }
          })
        }
      }
    })
  }
}