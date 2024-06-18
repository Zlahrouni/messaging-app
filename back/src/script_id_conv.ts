function ConversationExists(user_id_1 : number, user_id_2 : number) {
    if(user_id_1 == user_id_2){
        return "Les utilisateurs sont les mêmes, impossibe de créer un conversation"
    }else{
        let smaller = SmallerNumber(user_id_1, user_id_2);
        let bigger = BiggerNumber(user_id_1, user_id_2);

        let conversationId = `conversation_${smaller}-${bigger}`;
        return conversationId;
    }
    
}

function BiggerNumber(number_1 : number,  number_2 : number) {
    if (number_1 > number_2) {
        return number_1;
    } else {
        return number_2;
    }
}

function SmallerNumber(number_1 : number, number_2 : number) {
    if (number_1 < number_2) {
        return number_1;
    } else {
        return number_2;
    }
}

export default ConversationExists;
