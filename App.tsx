import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ImageBackground, Platform, PermissionsAndroid } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Picker } from '@react-native-picker/picker';
import QRScannerScreen from './screens/QRScannerScreen';

const firebaseConfig = {
  apiKey: "AIzaSyDeS2n6FOn1FsvhDfAxBkDBVpqFZwmi54A",
  authDomain: "coneiqqrscanner.firebaseapp.com",
  databaseURL: "https://coneiqqrscanner-default-rtdb.firebaseio.com",
  projectId: "coneiqqrscanner",
  storageBucket: "coneiqqrscanner.appspot.com",
  messagingSenderId: "1096158199255",
  appId: "1:1096158199255:web:f6457fcf57c80a02fc9f92",
  measurementId: "G-G89C43KMHP"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const databaseRef = ref(database, '/');
const rationale = {
  title: "Permiso de cámara necesario",
  message: "Esta aplicación necesita acceso a la cámara para funcionar correctamente.",
  buttonPositive: "OK",
};

const App = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<null | string>(null);
  const [modoEscaneo, setModoEscaneo] = useState(false);
  const [mensajeAsistencia, setMensajeAsistencia] = useState('');
  const [registroAsistencia, setRegistroAsistencia] = useState<string[]>([]);
  const [cursosUnicos, setCursosUnicos] = useState<string[]>([]);
  const [cursosDisponibles, setCursosDisponibles] = useState<string[]>([]);

  useEffect(() => {
    async function requestCameraPermission() {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            rationale
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setHasPermission(true);
          } else {
            setHasPermission(false);
          }
        } catch (err) {
          console.warn(err);
        }
      }
    }

    const cursosRef = ref(database);

    get(cursosRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const cursos = Object.keys(data);
          console.log('Cursos disponibles:', cursos);
          setCursosDisponibles(cursos);

          // Configura los cursos en cursosUnicos también
          setCursosUnicos(cursos);
        }
      })
      .catch((error) => {
        console.error('Error al leer los cursos disponibles:', error);
      });

    if (Platform.OS === 'android') {
      requestCameraPermission();
    }
  }, []);

  const dniRegistradoEnCurso = (dni: string, curso: string) => {
    const cursoRef = ref(database, `/${curso}/Asistencias/${dni}`);

    return get(cursoRef)
      .then((snapshot) => {
        return snapshot.exists();
      })
      .catch((error) => {
        console.error('Error al verificar el DNI en el curso:', error);
        return false;
      });
  };

  const handleBarCodeScanned = (data: string) => {
    if (!cursoSeleccionado) {
      alert('Por favor, elige un curso antes de escanear un código QR.');
      return;
    }

    dniRegistradoEnCurso(data, cursoSeleccionado)
      .then((registrado) => {
        if (registrado) {
          setScanned(true);

          const cursoRef = ref(database, `/${cursoSeleccionado}/Asistencias/${data}`);

          set(cursoRef, true)
            .then(() => {
              setMensajeAsistencia(`Se ha registrado la asistencia del DNI ${data}`);
            })
            .catch((error) => {
              console.error('Error al registrar la asistencia:', error);
            });
        } else {
          alert(`El DNI ${data} no está registrado en el curso seleccionado.`);
        }
      });
  };

  const handleVolverASeleccionar = () => {
    setScanned(false);
    setModoEscaneo(false);
    setMensajeAsistencia('');
  };

  if (hasPermission === null) {
    return <Text>Esperando permiso para acceder a la cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara. Por favor, otorga permisos en la configuración de tu dispositivo.</Text>;
  }

  if (modoEscaneo) {
    return (
      <QRScannerScreen
        onScan={handleBarCodeScanned}
        mensajeAsistencia={mensajeAsistencia}
        onReturn={handleVolverASeleccionar}
      />
    );
  }

  return (
    <ImageBackground
      source={require('./images/aseinq.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}> Asistencia CoNEIQ</Text>
        {mensajeAsistencia ? <Text>{mensajeAsistencia}</Text> : null}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cursoSeleccionado}
            onValueChange={(itemValue) => {
              setCursoSeleccionado(itemValue);
              setModoEscaneo(true);
              setScanned(false);
              setMensajeAsistencia('');
            }}
          >
            <Picker label="Selecciona un curso" value={null} />
            {cursosUnicos.map((curso) => (
              <Picker key={curso} label={curso.replace(/_/g, ' ')} value={curso} />
            ))}
          </Picker>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'rgb(235, 212, 255)',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'rgb(245, 240, 270)',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: 'rgb(3, 0, 6)',
    borderRadius: 35,
  },
  pickerContainer: {
    color: 'black',
    paddingHorizontal: 10,
    backgroundColor: 'rgb(245, 240, 270)',
  },
  text: {
    fontSize: 16,
    color: 'rgb(3, 0, 6)',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    elevation: 8,
    justifyContent: 'center',
    marginBottom: 8,
    marginHorizontal: 25,
    backgroundColor: 'rgb(245, 240, 270)',
    borderRadius: 15,
    paddingVertical: 8,
  },
});

export default App;
