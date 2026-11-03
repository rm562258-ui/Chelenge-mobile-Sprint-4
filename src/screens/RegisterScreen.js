import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeProvider';
import { registerFormSchema } from '../utils/formSchemas';

export default function RegisterScreen() {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const navigation = useNavigation();
    const { signUp, loading } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data) => {
        try {
            await signUp(data.name, data.email, data.password);
        } catch {
            // O AuthContext já informa o erro ao usuário.
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Criar conta</Text>
                <Text style={styles.subtitle}>Cadastre-se para começar a acompanhar seu pet</Text>

                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                        <AppInput
                            label="Nome"
                            placeholder="Seu nome completo"
                            value={value}
                            onChangeText={onChange}
                            error={errors.name?.message}
                            leftIcon="👤"
                        />
                    )}
                />

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

                <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, value } }) => (
                        <AppInput
                            label="Confirmar senha"
                            placeholder="********"
                            secureTextEntry
                            value={value}
                            onChangeText={onChange}
                            error={errors.confirmPassword?.message}
                            leftIcon="🔐"
                        />
                    )}
                />

                <AppButton
                    title="Cadastrar"
                    onPress={handleSubmit(onSubmit)}
                    loading={loading || isSubmitting}
                    disabled={loading || isSubmitting}
                    style={{ width: '100%', marginTop: 16 }}
                />

                <View style={styles.inlineRow}>
                    <Text style={styles.bottomText}>Já possui conta?</Text>
                    <Text style={styles.linkText} onPress={() => navigation.popTo('Login')}>
                        Entrar
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
