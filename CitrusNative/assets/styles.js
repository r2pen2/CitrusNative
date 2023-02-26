const experimental = {
    invertBadges: false,
}

export const measurements = {
    entryHeight: 60,
}

export const textStyles = {
    entryFontSize: 26,
}

export const darkTheme = {
    backgroundGradient: ['rgba(34,197,94,0.05)', '#1E2028'],
    backgroundGradientBackground: "#1E2028",
    badgeBorder: experimental.invertBadges ? "#0A1930" : "#EEF0F3",
    badgeText: experimental.invertBadges ? "#0A1930" : "#EEF0F3",
    buttonBorder: "#FCFCFC",
    buttonBorderDisabled: "#767676",
    buttonFill: '#22242E',
    cardBorder: "#FCFCFC",
    cardFill: '#22242E',
    popupGradient: ['rgba(34,197,94,0.05)', '#1E2028'],
    selectedFill: ['#1a533d', '#41356b'],
    settingsCardFill: '#22242E',
    statusBarColor: "#1E2028",
    tabBarColor: "#1E2028",
    textFieldBorderColor: "#FCFCFC",
    textFieldFill: "#1E2028",
    textSecondary: "#767676",
    textPrimary: "#FCFCFC",
}

export const lightTheme = {
    backgroundGradient: ['rgba(34,197,94,0.05)', "#F4F5F5"],
    backgroundGradientBackground: "#F4F5F5",
    badgeBorder: experimental.invertBadges ? "#EEF0F3" : "#0A1930",
    badgeText: experimental.invertBadges ? "#EEF0F3" : "#0A1930",
    buttonBorder: "#0A1930",
    buttonBorderDisabled: "#8C8C8C",
    buttonFill: "#EEF0F3",
    cardBorder: "#0A1930",
    cardFill: "#EEF0F3",
    backgroundGradient: ['rgba(34,197,94,0.05)', "#F4F5F5"],
    selectedFill: ["#7ce7af", "#ab9dd0"],
    settingscardFill: "#EEF0F3",
    statusBarColor: "#F4F5F5",
    tabBarColor: "#F4F5F5",
    textFieldBorderColor: "#0A1930",
    textFieldFill: "#F4F5F5",
    textSecondary: "#8C8C8C",
    textPrimary: "#0A1930",
}

export const globalColors = {
    disabledGradient: ['#6543ac', '#888888'],
    selectedGradient: ['#00DD66', '#6442AC'],
    whiteGradient: ['#6543ac', '#888888'],
    greenGradient: ['#6543ac', '#00DD66'],
    redGradient: ['#6543ac', '#FD3C4A'],
    green: "#22C55E",
    greenAlpha: "rgba(34, 197, 94, 0.2)",
    red: "#FD3C4A",
    venmo: "#008CFF"
}

export const darkPage = {
    display: 'flex', 
    height: "100%", 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    paddingLeft: 20, 
    paddingRight: 20,
};

export const pageHeaderStyle = { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: "#fcfcfc", 
    marginTop: 10,
    marginBottom: 10,
};

export const newTranscationGradientStyle = {
    width: "100%", 
    borderRadius: 15, 
    height: 80, 
    padding: 1, 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5,
    marginBottom: 10 
}

export const newTransactionCardStyle = {
    borderRadius: 14, 
    width: '100%', 
    padding: 16, 
    height: "100%", 
    display: 'flex', 
    direction: "row", 
    justifyContent: "center", 
    backgroundColor: '#22242E',
}

export const buttonStyleSmall = {
    borderRadius: 20
}