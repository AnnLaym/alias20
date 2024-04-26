import { Ref } from "vue";
import { userLang } from "./service";

export function getKnopkaName(knopkaId: keyof typeof knopki) {
    return knopki[knopkaId]?.title[userLang.value]
}
export function getPackKnopkaName(PackKnopkaId: keyof typeof packKnopkaName) {
    return packKnopkaName[PackKnopkaId]?.title[userLang.value]
}

type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};
interface KnopkaMetaData {
    title: PartialRecord<any, any>;
}
interface PackKnopkaName {
    title: PartialRecord<any, any>;
}
const knopki = {
    'teams': {
        title: {
            ru: 'Команды:',
            ua: 'Команди:',
            en: 'Teams:',
        }
    },
    'easy': {
        title: {
            ru: 'Легкий',
            ua: 'Легкий',
            en: 'Easy',
        }
    },
    'normal': {
        title: {
            ru: 'Нормальный',
            ua: 'Нормальний',
            en: 'Normal',
        }
    },
    'hard': {
        title: {
            ru: 'Сложный',
            ua: 'Складний',
            en: 'Hard',
        }
    },
    'insane': {
        title: {
            ru: 'Безумный',
            ua: 'Божевільний',
            en: 'Insane',
        }
    },
    'delete': {
        title: {
            ru: 'Удалить',
            ua: 'Видалити',
            en: 'Delete',
        }
    },
    'explain words': {
        title: {
            ru: 'Объясняйте слова',
            ua: 'Пояснюйте слова',
            en: 'Explain words',
        }
    },
    'guess words': {
        title: {
            ru: 'Угадывайте слова',
            ua: 'Вгадуйте слова',
            en: 'Guess words',
        }
    },
    'spektators': {
        title: {
            ru: 'Зрители:',
            ua: 'Глядачі:',
            en: 'Spectators:',
        }
    },
    'waitingforHost': {
        title: {
            ru: 'Ожидайте пока хост начнет игру',
            ua: 'Чекайте поки хост почне гру',
            en: 'Waiting for host to start game',
        }
    },
    'waitingforTeam': {
        title: {
            ru: 'Ожидаем готовности команды',
            ua: 'Очікуємо готовності команди',
            en: 'Waiting for team to be ready',
        }
    },
    'Prepare to explain': {
        title: {
            ru: 'Приготовьтесь объяснять слова',
            ua: 'Приготуйтесь пояснювати слова',
            en: 'Prepare to explain words',
        }
    },
    'U can start': {
        title: {
            ru: '',
            ua: '',
            en: '',
        }
    },
    'start': {
        title: {
            ru: 'Начать!',
            ua: 'Почати!',
            en: 'Start!',
        }
    },
    'ready': {
        title: {
            ru: 'Готов!',
            ua: 'Готовий!',
            en: 'Ready!',
        }
    },
    'score': {
        title: {
            ru: 'Счет:',
            ua: 'Рахунок:',
            en: 'Score:',
        }
    },
    'hostStartGame': {
        title: {
            ru: 'Вы можете запустить игру!',
            ua: 'Ви можете почати гру!',
            en: 'You can start the game!',
        }
    },
    'zapustit': {
        title: {
            ru: 'Начать',
            ua: 'Почати',
            en: 'Start',
        }
    },
    'next': {
        title: {
            ru: 'Далее',
            ua: 'Далі',
            en: 'Next',
        }
    },
    'players': {
        title: {
            ru: 'Игроки:',
            ua: 'ГРавці:',
            en: 'Players:',
        }
    },
    

} satisfies Record<string, KnopkaMetaData>

const packKnopkaName = {
    'owner': {
        title: {
            ru: 'Автор:',
            ua: 'Автор:',
            en: 'by',
        }
    },
    'playPack': {
        title: {
            ru: 'Выбрать пак',
            ua: 'Обрати пак',
            en: 'Choose pack',
        }
    },
    'o pake': {
        title: {
            ru: 'О паке:',
            ua: 'Про пак:',
            en: 'About pack:',
        }
    },
    'слов': {
        title: {
            ru: 'слов',
            ua: 'слів',
            en: 'words',
        }
    },
    'CreateDate': {
        title: {
            ru: 'Дата создания:',
            ua: 'Дата створення:',
            en: 'Create date:',
        }
    },
    'updateDate': {
        title: {
            ru: 'Дата обновления:',
            ua: 'Дата оновлення:',
            en: 'Date of update:',
        }
    },
} satisfies Record<any, PackKnopkaName>