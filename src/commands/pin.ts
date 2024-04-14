import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, PermissionsBitField } from 'discord.js';
import {
  SlashCommand,
  CommandContext,
  SlashCreator,
  AutocompleteContext,
  CommandOptionType,
  ApplicationCommandType,
  User,
  ComponentType,
  ButtonStyle
} from 'slash-create';

async function getAllPins(channelId: string) {
  const allPinnedMessages = await fetch(`https://discord.com/api/v10/channels/${channelId}/pins`, {
    method: 'GET',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
    }
  });
  if (!allPinnedMessages.ok) return [];
  const allPinnedMessagesObject = await allPinnedMessages.json();
  return allPinnedMessagesObject;
}

async function checkIfMessageIsPinned(channelId: string, messageId: string) {
  const allPinnedMessagesObject = await getAllPins(channelId);
  return allPinnedMessagesObject.some((msg: any) => msg.id === messageId);
}

async function pinMessage(channelId: string, messageId: string, user: User) {
  const req = await fetch(`https://discord.com/api/v10/channels/${channelId}/pins/${messageId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'X-Audit-Log-Reason': `Pin requested by ${user.globalName} (${user.id})`
    }
  }).catch((err) => {
    console.error(err);
  });
  return true;
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
    body: JSON.stringify({ content })
  });
  return req.ok;
}

export default class SendTagCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'Pin Message',
      deferEphemeral: true,
      dmPermission: false,
      type: ApplicationCommandType.MESSAGE,
      requiredPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(ctx: CommandContext) {
    if (!ctx.guildID)
      return ctx.send(':passport_control: This command can only be used in a server.', { ephemeral: true });

    const allPinnedMessages = await getAllPins(ctx.channelID);

    const isAlreadyPinned = allPinnedMessages.some((msg: any) => msg.id === ctx.targetMessage.id);
    if (isAlreadyPinned) return ctx.send(`:x: Message is already pinned.`, { ephemeral: true });

    const sortedPinnedMessages = allPinnedMessages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    if (sortedPinnedMessages.length >= 50) {
      await ctx.defer(true);
      await ctx.send(
        `:stop_button: You can only have 50 pinned messages in a channel.\n\nInteract with the button below to unpin the [oldest pinned message](<https://discord.com/channels/${ctx.guildID}/${ctx.channelID}/${sortedPinnedMessages[0].id}>).`,
        {
          components: [
            {
              type: ComponentType.ACTION_ROW,
              components: [
                {
                  type: ComponentType.BUTTON,
                  style: ButtonStyle.PRIMARY,
                  label: 'Unpin Oldest Message',
                  custom_id: 'unpinOldest',
                  emoji: {
                    name: '📌'
                  }
                }
              ]
            }
          ],
          ephemeral: true
        }
      );

      ctx.registerComponent('unpinOldest', async (buttonCtx) => {
        const unpinReq = await unpinMessage(ctx.channelID, sortedPinnedMessages[0].id);
        if (!unpinReq) return buttonCtx.send(`:x: Failed to unpin message`, { ephemeral: true });

        const pinnedMsg = await pinMessage(ctx.channelID, ctx.targetMessage.id, ctx.user);
        if (!pinnedMsg) return buttonCtx.send(`:x: Failed to pin message`, { ephemeral: true });

        await createChannelMessage(
          ctx.channelID,
          `<@${ctx.user.id}> unpinned the [oldest pinned message](<https://discord.com/channels/${ctx.guildID}/${ctx.channelID}/${sortedPinnedMessages[0].id}>), and pinned the [original message](<https://discord.com/channels/${ctx.guildID}/${ctx.channelID}/${ctx.targetMessage.id}>).`
        );
        return buttonCtx.editParent(
          `:white_check_mark: Unpinned the oldest pinned message, and pinned the original message.`,
          { components: [] }
        );
      });

      return;
    }

    const pinnedMsg = await pinMessage(ctx.channelID, ctx.targetMessage.id, ctx.user);
    if (!pinnedMsg) return ctx.send(`:x: Failed to pin message`, { ephemeral: true });

    await createChannelMessage(
      ctx.channelID,
      `<@${ctx.user.id}> pinned message: https://discord.com/channels/${ctx.guildID}/${ctx.channelID}/${ctx.targetMessage.id}. Total channel pins: ${sortedPinnedMessages.length + 1}`
    );
    return ctx.send(
      `:+1: Pinned message: https://discord.com/channels/${ctx.guildID}/${ctx.channelID}/${ctx.targetMessage.id}`,
      { ephemeral: true }
    );
  }
}
