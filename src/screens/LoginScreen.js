import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeProvider';
import { loginFormSchema } from '../utils/formSchemas';

export default function LoginScreen() {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const navigation = useNavigation();
    const { signIn, loading } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        try {
            await signIn(data.email, data.password);
        } catch {
            // O AuthContext já informa o erro ao usuário.
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>ClyvoCare Pet</Text>
                <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>

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

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <AppInput
                            label="Senha"
                            placeholder="********"
                            secureTextEntry
                            value={value}
                            onChangeText={onChange}
                            error={errors.password?.message}
                            leftIcon="🔒"
                        />
                    )}
                />

                <Text style={styles.linkText} onPress={() => navigation.navigate('ForgotPassword')}>
                    Esqueci minha senha
                </Text>

                <AppButton
                    title="Entrar"
                    onPress={handleSubmit(onSubmit)}
                    loading={loading || isSubmitting}
                    disabled={loading || isSubmitting}
                    style={{ width: '100%', marginTop: 16 }}
                />

                <View style={styles.inlineRow}>
                    <Text style={styles.bottomText}>Ainda não tem conta?</Text>
                    <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
                        Cadastre-se
                    </Text>
                </View>

                {loading ? <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} /> : null}
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
    inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18 },
});
