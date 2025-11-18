import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D3557',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#F1FAEE',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#F1FAEE',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#F1FAEE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupText: {
    color: '#F1FAEE',
    marginTop: 20,
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  testCredentials: {
    color: '#A8DADC',
    marginTop: 15,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#457B9D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#F1FAEE',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default styles;
