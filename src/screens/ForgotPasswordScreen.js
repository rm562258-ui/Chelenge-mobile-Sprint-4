import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeProvider';

const forgotPasswordSchema = z.object({
    email: z.string().trim().email('Informe um e-mail válido.'),
});

export default function ForgotPasswordScreen() {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const navigation = useNavigation();
    const { resetPassword, loading } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data) => {
        await resetPassword(data.email);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Recuperar senha</Text>
                <Text style={styles.subtitle}>Informe seu e-mail para receber o link de redefinição</Text>

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <AppInput
                            label="E-mail"
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            value={value}
                            onChangeText={onChange}
                            error={errors.email?.message}
                            leftIcon="✉️"
                        />
                    )}
                />

                <AppButton
                    title="Enviar link"
                    onPress={handleSubmit(onSubmit)}
                    loading={loading || isSubmitting}
                    disabled={loading || isSubmitting}
                    style={{ width: '100%', marginTop: 16 }}
                />

                <View style={styles.inlineRow}>
                    <Text style={styles.bottomText}>Lembrou a senha?</Text>
                    <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
                        Voltar para login
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 30, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 18 },
    linkText: { color: colors.info, fontWeight: '700', marginTop: 12, textAlign: 'right' },
    bottomText: { color: colors.textMuted, marginRight: 6 },
    inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
});
