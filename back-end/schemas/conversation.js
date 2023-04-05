export default {
  name: "conversation",
  title: "Conversation",
  type: "document",
  fields: [
    {
      name: "messages",
      title: "Messages",
      type: "array",
      of: [
        {
          type: "message",
        },
      ],
    },
    {
      name: "members",
      title: "Members",
      type: "array",
      of: [
        {
          type: "user",
        },
      ],
    },
  ],
};
