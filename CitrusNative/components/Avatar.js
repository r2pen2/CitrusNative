import { Image, Pressable, View } from 'react-native'
import { useContext, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { DBManager } from '../api/dbManager';
import { UsersContext, CurrentUserContext, FocusContext, TransactionsContext } from '../Context';
import { globalColors } from '../assets/styles';

export function AvatarIcon(props) {

    const [imgSrc, setImgSrc] = useState(props.src ? {uri: props.src} : null);
    const { usersData, setUsersData } = useContext(UsersContext);
    const { focus } = useContext(FocusContext);
    const { currentUserManager } = useContext(CurrentUserContext);

    useEffect(() => {
        async function fetchSource() {
            if (!props.id) {
                return;
            }
            if (props.id === currentUserManager.documentId) {
                setImgSrc({uri: currentUserManager.data.personalData.pfpUrl});
            } else if (usersData[props.id]) {
                setImgSrc({uri: usersData[props.id].personalData.pfpUrl});
            } else {
                const userManager = DBManager.getUserManager(props.id);
                await userManager.fetchData();
                setImgSrc({uri: userManager.data.personalData.pfpUrl});
                const newData = {...usersData};
                newData[props.id] = userManager.data;
                setUsersData(newData);
            }
        }
        fetchSource();
    }, [usersData, focus, props])

  return (
    <Pressable
    onPress={props.onClick}
    android_ripple={{color: globalColors.greenAlpha, radius: 10}}>
    <LinearGradient 
        start={[0, 0]}
        end={[1, 1]}
        colors={['#00DD66', '#6442AC']}
        pointerEvents="none"
        style={{
            borderRadius: props.size ? props.size / 2 : 25,
            width: props.size ? props.size : 50,
            height: props.size ? props.size : 50,
            marginRight: props.marginRight ? props.marginRight : 0,
            marginLeft: props.marginLeft ? props.marginLeft : 0,
            }}>
        <Pressable 
            style={{
              width: props.size ? props.size : 50, 
              height: props.size ? props.size : 50,
            }} 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center"
            pointerEvents="none"
        >
            { imgSrc && <Image 
                source={imgSrc} 
                style={{
                    width: props.size ? (props.size - (props.borderWidth ? props.borderWidth / 2 : (props.size / 20))) : 45, 
                    height: props.size ? (props.size - (props.borderWidth ? props.borderWidth / 2 : (props.size / 20))) : 45,
                    borderRadius: props.size ? (props.size / 2) : 25
                }} />}
        </Pressable>
  </LinearGradient>

    </Pressable>
  )
}

export function AvatarList(props) {

    function renderAvatars() {
      return props.users.map((userId, index) => {
        return <AvatarIcon id={userId} key={index} size={props.size ? props.size: 30} marginRight={props.marginRight ? props.marginRight : 0} marginLeft={props.marginLeft ? props.marginLeft : 0} onClick={props.onClick}/>
      })
    }

    return (
        <View 
            pointerEvents="none" 
            display="flex" 
            flexDirection="row" 
            alignItems="center" 
            justifyContent={props.justifyContent ? props.justifyContent : "center"} 
            style={{
                marginTop: props.marginTop ? props.marginTop : 0,
                marginLeft: props.marginLeft ? (props.marginLeft * -1) : 0,
                marginRight: props.marginRight ? (props.marginRight * -1) : 0,
                }} >
            { renderAvatars() }
        </View>
    )
}

export function GroupRelationAvatars(props) {

    const [transactionUsers, setTransactionUsers] = useState([]);
    const { transactionsData } = useContext(TransactionsContext);
  
    useEffect(() => {
      if (!transactionsData[props.transaction]) {
        return;
      }
      let newUsers = [];
      for (const userId of Object.keys(transactionsData[props.transaction].balances)) {
        newUsers.push(userId);
      }
      setTransactionUsers(newUsers);
    }, [transactionsData])
  
    return <AvatarList users={transactionUsers} onClick={props.onClick} justifyContent="flex-end" marginRight={-5} />
}