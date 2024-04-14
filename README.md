<div align="center">
<img width="256" src="https://cdn.buape.com/PinBot.png" alt="PinBot Logo"></a>
<style>
  img {
    border-radius: 25%;
  }
</style>
</div>

# PinBot

📌 PinBot enables communities to allow users to pin messages even without the MANAGE_MESSAGES permission.

Some of the use cases PinBot might serve are:

- A community that wants to allow members to pin messages, but aren't comfortable giving them the MANAGE_MESSAGES permission.
- A lazy admin who doesn't want to click the three dots and then click "Pin Message" every time they want to pin a message.

## Commands

- `Pin Message` - This is a message context menu command that allows users to pin messages. If a channel has reached its pin limit, the bot will offer the user the option to unpin the oldest pinned message.
- `Unpin Message` - This is a message context menu command that allows users to unpin messages.

## Self Hosting

### Prerequisites

Right now the bot is pretty simple to setup and run. You'll need to have the following:

- A non-ancient version of Node.js
- [pnpm](https://pnpm.io) installed globally
- A Discord bot application

### Setup

1. Clone the repository `git clone https://github.com/Codeize/PinBot.git`
2. Run `pnpm install`
3. Create a `.env` file in the root of the project based on `.env.example`, all `DISCORD_` variables can be found in the Discord Developer Portal, `COMMANDS_DEBUG` and `DEVELOPMENT_GUILD_ID` aren't required but are useful for development, `PORT` can remain as it is, if you know you need to change it, you probably know how to change it.
4. Run `pnpm run build`
5. Run `pnpm run sync`
6. Run `pnpm run start`

### Hosting

For the sake of transparency, the [public version of PinBot](https://go.buape.com/PinBot) is hosted on [Hop.io](https://hop.io) but you can host it anywhere you want.

The main thing to keep in mind is that once your application is hosted on a public URL, you'll need to add it to the [Interactions Endpoint URL](https://discord.com/developers/docs/tutorials/upgrading-to-application-commands#adding-an-interactions-endpoint-url) in the Discord Developer Portal.

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

## Notes

The only permission the bot requires aside from basic `VIEW_CHANNEL` and `SEND_MESSAGES` is `MANAGE_MESSAGES`.

If you have any questions, or similarly if you find any issues with the bot, feel free to [create an issue](https://github.com/Codeize/PinBot/issues/new) or join the [Buape Discord Server](https://go.buape.com/discord).
