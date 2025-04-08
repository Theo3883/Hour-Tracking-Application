'use client'

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#0F172A',
  },
  section: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    color: '#1E293B',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
  },
  tableHeader: {
    backgroundColor: '#F8FAFC',
  },
  tableCell: {
    padding: 8,
    flex: 1,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
  },
});

interface Column {
  key: string;
  header: string;
  width?: number;
}

interface PdfGeneratorProps {
  fileName: string;
  title: string;
  sections: {
    title: string;
    data: Record<string, unknown>[];
    columns: Column[];
  }[];
}

// PDF Document Component
const PdfDocument = ({ title, sections }: Omit<PdfGeneratorProps, 'fileName'>) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{title}</Text>
      
      {sections.map((section, sIndex) => (
        <View key={sIndex}>
          <Text style={styles.section}>{section.title}</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              {section.columns.map((col, i) => (
                <Text 
                  key={i} 
                  style={[
                    styles.tableCell, 
                    { ...(col.width ? { flex: col.width } : {}) }
                  ]}
                >
                  {col.header}
                </Text>
              ))}
            </View>
            
            {section.data.map((item, rIndex) => (
              <View key={rIndex} style={styles.tableRow}>
                {section.columns.map((col, cIndex) => (
                  <Text 
                    key={cIndex}
                    style={[
                      styles.tableCell,
                      ...(col.width ? [{ flex: col.width }] : [])
                    ]}
                  >
                    {item[col.key]?.toString() || ''}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      ))}
      
      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()}
      </Text>
    </Page>
  </Document>
);

const PdfGenerator = ({ fileName, title, sections }: PdfGeneratorProps) => {
  return (
    <PDFDownloadLink
      document={<PdfDocument title={title} sections={sections} />}
      fileName={fileName}
    >
      {({  loading }) => (
        <Button 
          variant="custom" 
          disabled={loading}
          className="flex items-center gap-2 rounded-full"
        >
          <Image
            src="/icons/Download.svg"
            alt="Download"
            width={20}
            height={20}
            className="brightness-0 invert"
          />
          {loading ? 'Generating PDF...' : 'Download Report'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PdfGenerator;