import { View, Image} from 'react-native'
import { useContext, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { DBManager } from '../api/dbManager';
import { UsersContext, CurrentUserContext, FocusContext } from '../Context';

export default function AvatarIcon(props) {

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
    }, [usersData, focus])

  return (
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
        <View 
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
        </View>
  </LinearGradient>
  )
}