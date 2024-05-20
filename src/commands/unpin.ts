import { MessageFlagsBitField } from 'discord.js';
import { ApplicationCommandType, CommandContext, SlashCommand, SlashCreator } from 'slash-create';

async function getAllPins(channelId: string) {
  const allPinnedMessages = await fetch(`https://discord.com/api/v10/channels/${channelId}/pins`, {
    method: 'GET',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
    }
  });
  if (!allPinnedMessages.ok) return [];
  return await allPinnedMessages.json();
}

async function checkIfMessageIsPinned(channelId: string, messageId: string) {
  const allPinnedMessagesObject = await getAllPins(channelId);
  return allPinnedMessagesObject.some((msg: any) => msg.id === messageId);
}

async function unpinMessage(channelId: string, messageId: string) {
  const req = await fetch(`https://discord.com/api/v10/channels/${channelId}/pins/${messageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
    }
  });
  return req.ok;
}

async function createChannelMessage(channelId: string, content: string) {
  const req = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content, flags: MessageFlagsBitField.Flags.SuppressEmbeds })
  });
  return req.ok;
}

export default class SendTagCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'Unpin Message',
      deferEphemeral: true,
      dmPermission: false,
      type: ApplicationCommandType.MESSAGE,
      requiredPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(ctx: CommandContext) {
    if (!ctx.guildID)
      return ctx.send(':passport_control: This command can only be used in a server.', { ephemeral: true });

    const isAlreadyUnpinned = await checkIfMessageIsPinned(ctx.channelID, ctx.targetMessage.id);
    if (!isAlreadyUnpinned) return ctx.send(`:x: Message is not pinned`, { ephemeral: true });

    const unpinnedMsg = await unpinMessage(ctx.channelID, ctx.targetMessage.id);
    if (!unpinnedMsg) return ctx.send(`:x: Failed to unpin message`, { ephemeral: true });

    await createChannelMessage(
      ctx.channelID,
      `<@${ctx.user.id}> unpinned message: <https://discord.com/channels/${ctx.guildID}/${ctx.channelID}/${ctx.targetMessage.id}>`
    );
    return ctx.send(
      `:+1: Unpinned message: <https://discord.com/channels/${ctx.guildID}/${ctx.channelID}/${ctx.targetMessage.id}>`,
      { ephemeral: true }
    );
  }
}
