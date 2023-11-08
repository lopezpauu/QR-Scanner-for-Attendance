import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

type QRScannerScreenProps = {
  onScan: (data: string) => void;
  mensajeAsistencia: string;
  onReturn: () => void;
};

function QRScannerScreen({ onScan, mensajeAsistencia, onReturn }: QRScannerScreenProps) {
  const [scanned, setScanned] = useState(false);
  const [scannedDNIs, setScannedDNIs] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scannedDNIs.includes(data)) {
      setScanned(true);
      setScannedDNIs([...scannedDNIs, data]);
      onScan(data);
    } else {
      setShowAlert(true);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {mensajeAsistencia !== '' && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{mensajeAsistencia}</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonStyle} onPress={onReturn}>
          <Text style={styles.buttonText}>Volver a seleccionar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Escanear otro código QR</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={showAlert} transparent animationType="slide">
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>Este DNI ya ha sido escaneado.</Text>
          <TouchableOpacity style={styles.alertButton} onPress={closeAlert}>
            <Text style={styles.alertButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    position: 'absolute',
    bottom: '25%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  messageText: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 1,
    left: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
  },
  buttonStyle: {
    backgroundColor: 'rgb(245, 240, 270)',
    borderRadius: 15,
    paddingVertical: 6,
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    color: 'rgb(3, 0, 6)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  alertText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: 'rgb(245, 240, 270)',
    borderRadius: 15,
    padding: 10,
  },
  alertButtonText: {
    fontSize: 14,
    color: 'rgb(3, 0, 6)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default QRScannerScreen;
