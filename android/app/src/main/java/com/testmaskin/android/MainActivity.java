package com.testmaskin.android;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        android.webkit.WebView wv = new android.webkit.WebView(this);
        setContentView(wv);
        wv.getSettings().setJavaScriptEnabled(true);

	/* Viser grensesnitt fra express-tjener i dockerkontainer
	   via kontainer-vertens ip-adresse og kontainerens
	   eksponerte port. */

        wv.loadUrl("http://testmaskin:80/");
        wv.setWebViewClient(new WebViewClient());
    }
}
