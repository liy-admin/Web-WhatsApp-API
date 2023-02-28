async function addContactsToGroup() {
    const { Client , LocalAuth ,GroupChat} = require('whatsapp-web.js');
    const qrcode = require('qrcode-terminal');
    const fs = require('fs');

    const SESSION_FILE_PATH = './admin.json';

    const groupName = 'Kyc'; // 填入需要添加联系人的群组名字
    let sessionData;

    // 检查是否存在session文件，如果有则加载session数据
    if (fs.existsSync(SESSION_FILE_PATH)) {
        sessionData = require(SESSION_FILE_PATH);
    }

    // 创建一个新的客户端实例
    const client = new Client({
        session: sessionData,
        authStrategy: new LocalAuth({ clientId: "client-one" }),
        disableSpins: true,
        multiDevice: false // 添加该配置项
    });


    // 监听二维码生成事件并输出到终端
    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    // 监听登录成功事件
    let groupID;
    client.on('ready', async () => {
        console.log('Client is ready!');

        const chat = await client.getContacts();

            chat_loop:
                for (let contact of chat) {
                    if (contact.name == groupName) {
                        if (!contact.isGroup) {
                            console.log('no');
                        } else {
                            console.log(`他是一个群组${contact.isGroup}+名字${contact.name} + id ${contact.id.user}`);
                            groupID = contact.id._serialized;
                            break chat_loop;
                        }
                    }
                }



        // 获取指定群组
        const group = await client.getChatById(groupID);
        console.log(`${group.name}  群组以获取! 他的ID是 ${group.id}`);
        // 获取所有联系人
        client.getContacts().then((contacts) => {
            // 截取前CONTACTS_TO_ADD个联系人
            const CONTACTS_TO_ADD = 100; // 填入需要一次性添加的联系人数量
            const contactsToAdd = contacts.slice(0, CONTACTS_TO_ADD);

            // 将联系人逐个添加到群组中

            contactsToAdd.forEach((contact) => {
                group.addParticipants([contact.id._serialized]).then(() => {
                    console.log(`Added ${contact.name} to the group.`);
                }).catch((error) => {
                    console.error(`Failed to add ${contact.name} to the group: ${error}`);
                });
            });
        });
    });

    // 监听接收消息事件
    client.on('message', (message) => {
        if (message.body === 'ping') {
            message.reply('pong');
        }
    });

    // 监听异常事件
    client.on('auth_failure', () => {
        console.error('Authentication failure!');
    });

    client.initialize();
}

addContactsToGroup();
