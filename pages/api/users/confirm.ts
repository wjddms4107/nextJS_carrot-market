import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { token } = req.body;
  console.log('token:',token)

  const foundToken = await client.token.findUnique({
    where: {
      payload: token,
    },
  });

  console.log('foundToken:',foundToken)

  if (!foundToken) return res.status(404).end();
  req.session.user = {
    id: foundToken.userId,
  };

  await req.session.save();

  await client.token.deleteMany({
    where: {
      userId: foundToken.userId,
    },
  });
  res.json({ ok: true });
}

export default withApiSession(
  withHandler({ methods: ["POST"], handler, isPrivate: false })
);