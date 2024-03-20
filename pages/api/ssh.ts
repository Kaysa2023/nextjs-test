import { generateKeyPairSync } from 'crypto';
import { writeFileSync, unlink } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username } = req.body;

    const keyPair = generateKeyPairSync('rsa', {
        modulusLength: 2048,
    });

    const timestamp = Date.now();
    const publicKeyPath = join(process.cwd(), './public', `${username}_${timestamp}_public.pem`);
    const privateKeyPath = `${username}_${timestamp}_private.pem`;

    writeFileSync(publicKeyPath, keyPair.publicKey.export({ type: 'pkcs1', format: 'pem' }));

    // 在10分钟后删除公钥文件
    setTimeout(() => {
        unlink(publicKeyPath, (err) => {
            if (err) {
                console.error(`Failed to delete public key: ${err}`);
            }
        });
    }, 10 * 60 * 1000);  // 10分钟

    res.status(200).json({ privateKey: keyPair.privateKey.export({ type: 'pkcs1', format: 'pem' }), privateKeyPath });
}